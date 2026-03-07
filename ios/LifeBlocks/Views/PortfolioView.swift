import SwiftUI

struct PortfolioView: View {
    @EnvironmentObject var store: BlockStore

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Portfolio")
                .font(.headline)

            ForEach(HabitCategory.allCases, id: \.self) { category in
                let categoryHabits = habitsByCategory(category)

                VStack(alignment: .leading, spacing: 8) {
                    Text("\(category.icon) \(category.label)")
                        .font(.subheadline.bold())
                        .foregroundStyle(.secondary)

                    ForEach(categoryHabits) { habit in
                        HabitRow(habit: habit, blocks: store.allocations[habit.id] ?? 0)
                    }
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

struct HabitRow: View {
    let habit: Habit
    let blocks: Int
    @EnvironmentObject var store: BlockStore

    private var multiplier: Double {
        calculateMultiplier(streak: store.streak)
    }

    var body: some View {
        HStack(spacing: 12) {
            Text(habit.emoji)
                .font(.title2)

            VStack(alignment: .leading, spacing: 2) {
                Text(habit.name)
                    .font(.subheadline.bold())
                if blocks > 0 {
                    Text("\(blocksToTime(blocks)) \u{2022} \(String(format: "%+.1f%%", calculateHabitReturn(habit: habit, blocks: blocks, multiplier: multiplier)))")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            HStack(spacing: 8) {
                Button {
                    store.removeBlock(habitId: habit.id)
                } label: {
                    Image(systemName: "minus.circle.fill")
                        .foregroundStyle(blocks > 0 ? .red : Color(.systemGray4))
                }
                .disabled(blocks == 0)

                Text("\(blocks)")
                    .font(.body.monospacedDigit().bold())
                    .frame(minWidth: 24)

                Button {
                    store.addBlock(habitId: habit.id)
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .foregroundStyle(store.availableBlocks > 0 ? .green : Color(.systemGray4))
                }
                .disabled(store.availableBlocks == 0)
            }
            .font(.title3)
        }
        .padding(.vertical, 4)
    }
}
