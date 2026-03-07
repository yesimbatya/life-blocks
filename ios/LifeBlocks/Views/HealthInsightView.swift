import SwiftUI

struct HealthInsightView: View {
    @EnvironmentObject var store: BlockStore
    @EnvironmentObject var healthManager: HealthManager
    @EnvironmentObject var screenTime: MockScreenTime

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Insights")
                .font(.headline)

            // MARK: - HealthKit

            if healthManager.isAuthorized {
                InsightRow(
                    emoji: "😴",
                    title: "Sleep",
                    value: String(format: "%.1fh last night", healthManager.sleepHours),
                    buttonLabel: "+\(healthManager.suggestedSleepBlocks) blocks",
                    color: .indigo
                ) {
                    store.addBlocks(habitId: "sleep", count: healthManager.suggestedSleepBlocks)
                }

                InsightRow(
                    emoji: "🏃",
                    title: "Workout",
                    value: String(format: "%.0fm today", healthManager.workoutMinutes),
                    buttonLabel: "+\(healthManager.suggestedExerciseBlocks) blocks",
                    color: .orange
                ) {
                    store.addBlocks(habitId: "exercise", count: healthManager.suggestedExerciseBlocks)
                }
            } else if healthManager.isAvailable {
                Button {
                    healthManager.requestAuthorization()
                } label: {
                    HStack {
                        Image(systemName: "heart.fill")
                            .foregroundStyle(.red)
                        Text("Connect Health Data")
                            .font(.subheadline.bold())
                        Spacer()
                        Image(systemName: "chevron.right")
                            .foregroundStyle(.secondary)
                    }
                    .padding(12)
                    .background(Color(.tertiarySystemGroupedBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .buttonStyle(.plain)
            }

            Divider()

            // MARK: - Mock Screen Time

            HStack {
                Image(systemName: "hourglass")
                    .foregroundStyle(.purple)
                Text("Screen Time")
                    .font(.subheadline.bold())
                Spacer()
                Text("MOCK")
                    .font(.caption2.bold())
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.orange.opacity(0.2))
                    .foregroundStyle(.orange)
                    .clipShape(Capsule())
            }

            ForEach(screenTime.entries) { entry in
                HStack(spacing: 10) {
                    Image(systemName: entry.icon)
                        .frame(width: 20)
                        .foregroundStyle(.secondary)
                    Text(entry.appName)
                        .font(.subheadline)
                    Spacer()
                    Text("\(entry.minutes)m")
                        .font(.subheadline.monospacedDigit())
                        .foregroundStyle(.secondary)
                }
            }

            HStack(spacing: 8) {
                Button {
                    store.addBlocks(habitId: "scroll", count: screenTime.suggestedScrollBlocks)
                } label: {
                    HStack {
                        Text("📱 Scrolling")
                            .font(.caption.bold())
                        Spacer()
                        Text("+\(screenTime.suggestedScrollBlocks) blocks")
                            .font(.caption2)
                    }
                    .padding(10)
                    .background(Color(.systemGray5))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .buttonStyle(.plain)

                Button {
                    store.addBlocks(habitId: "netflix", count: screenTime.suggestedBingeBlocks)
                } label: {
                    HStack {
                        Text("📺 Binge")
                            .font(.caption.bold())
                        Spacer()
                        Text("+\(screenTime.suggestedBingeBlocks) blocks")
                            .font(.caption2)
                    }
                    .padding(10)
                    .background(Color(.systemGray5))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .buttonStyle(.plain)
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

struct InsightRow: View {
    let emoji: String
    let title: String
    let value: String
    let buttonLabel: String
    let color: Color
    let onAutoFill: () -> Void

    var body: some View {
        HStack {
            Text(emoji)
                .font(.title2)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline.bold())
                Text(value)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Button {
                onAutoFill()
            } label: {
                Text(buttonLabel)
                    .font(.caption.bold())
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(color.opacity(0.15))
                    .foregroundStyle(color)
                    .clipShape(Capsule())
            }
        }
    }
}
