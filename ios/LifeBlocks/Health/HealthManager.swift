import Foundation
import HealthKit

class HealthManager: ObservableObject {
    private let store = HKHealthStore()

    @Published var sleepHours: Double = 0
    @Published var workoutMinutes: Double = 0
    @Published var isAuthorized = false
    @Published var isAvailable = HKHealthStore.isHealthDataAvailable()

    var suggestedSleepBlocks: Int {
        // 6 blocks per hour (each block = 10 min)
        Int(round(sleepHours * 6.0))
    }

    var suggestedExerciseBlocks: Int {
        // 1 block per 10 minutes
        Int(round(workoutMinutes / 10.0))
    }

    func requestAuthorization() {
        guard isAvailable else { return }

        let readTypes: Set<HKObjectType> = [
            HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!,
            HKObjectType.workoutType(),
        ]

        store.requestAuthorization(toShare: nil, read: readTypes) { [weak self] success, _ in
            DispatchQueue.main.async {
                self?.isAuthorized = success
                if success {
                    self?.fetchSleep()
                    self?.fetchWorkouts()
                }
            }
        }
    }

    func fetchSleep() {
        guard let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else { return }

        let calendar = Calendar.current
        let now = Date()
        let startOfToday = calendar.startOfDay(for: now)
        let yesterdayEvening = calendar.date(byAdding: .hour, value: -6, to: startOfToday)!
        let todayNoon = calendar.date(byAdding: .hour, value: 12, to: startOfToday)!

        let predicate = HKQuery.predicateForSamples(withStart: yesterdayEvening, end: todayNoon, options: .strictStartDate)
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)

        let query = HKSampleQuery(sampleType: sleepType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [sort]) { [weak self] _, samples, _ in
            guard let samples = samples as? [HKCategorySample] else { return }

            let asleepValues: Set<Int> = [
                HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue,
                HKCategoryValueSleepAnalysis.asleepCore.rawValue,
                HKCategoryValueSleepAnalysis.asleepDeep.rawValue,
                HKCategoryValueSleepAnalysis.asleepREM.rawValue,
            ]

            let totalSeconds = samples
                .filter { asleepValues.contains($0.value) }
                .reduce(0.0) { $0 + $1.endDate.timeIntervalSince($1.startDate) }

            DispatchQueue.main.async {
                self?.sleepHours = totalSeconds / 3600.0
            }
        }

        store.execute(query)
    }

    func fetchWorkouts() {
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: Date())
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: Date(), options: .strictStartDate)
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)

        let query = HKSampleQuery(sampleType: HKObjectType.workoutType(), predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [sort]) { [weak self] _, samples, _ in
            guard let workouts = samples as? [HKWorkout] else { return }

            let totalMinutes = workouts.reduce(0.0) { $0 + $1.duration / 60.0 }

            DispatchQueue.main.async {
                self?.workoutMinutes = totalMinutes
            }
        }

        store.execute(query)
    }
}
