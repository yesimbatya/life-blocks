import Foundation

typealias Allocations = [String: Int]
typealias BlockAssignments = [String?]

func calculateMultiplier(streak: Int) -> Double {
    guard streak >= 1 else { return 1.0 }
    return pow(1.0 + Double(streak) * 0.01, Double(streak) / 7.0)
}

func calculateHabitReturn(habit: Habit, blocks: Int, multiplier: Double) -> Double {
    guard blocks > 0 else { return 0 }
    return habit.baseReturn * multiplier * Double(blocks)
}

func calculateTotalReturn(allocations: Allocations, streak: Int) -> Double {
    let multiplier = calculateMultiplier(streak: streak)
    return kHabits.reduce(0.0) { sum, habit in
        let blocks = allocations[habit.id] ?? 0
        return sum + calculateHabitReturn(habit: habit, blocks: blocks, multiplier: multiplier)
    }
}

func blocksToAllocations(_ blocks: BlockAssignments) -> Allocations {
    var result: Allocations = [:]
    for id in blocks.compactMap({ $0 }) {
        result[id, default: 0] += 1
    }
    return result
}

func countUsedBlocks(_ blocks: BlockAssignments) -> Int {
    blocks.compactMap { $0 }.count
}

func blocksToTime(_ blocks: Int) -> String {
    guard blocks > 0 else { return "0m" }
    let hours = blocks / 6
    let mins = (blocks % 6) * 10
    if hours == 0 { return "\(mins)m" }
    if mins == 0 { return "\(hours)h" }
    return "\(hours)h \(mins)m"
}

func todayString() -> String {
    let f = DateFormatter()
    f.dateFormat = "yyyy-MM-dd"
    return f.string(from: Date())
}

func isYesterday(_ dateStr: String) -> Bool {
    let f = DateFormatter()
    f.dateFormat = "yyyy-MM-dd"
    guard let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: Date()) else { return false }
    return dateStr == f.string(from: yesterday)
}
