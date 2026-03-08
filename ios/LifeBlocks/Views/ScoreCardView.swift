import SwiftUI

struct ScoreCardView: View {
    @EnvironmentObject var store: BlockStore
    @EnvironmentObject var settingsStore: SettingsStore

    private var totalReturn: Double {
        calculateTotalReturn(allocations: store.allocations, streak: store.streak, allHabits: settingsStore.allHabits)
    }

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Portfolio Return")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(String(format: "%+.1f%%", totalReturn))
                        .font(.system(size: 34, weight: .bold, design: .rounded))
                        .foregroundStyle(totalReturn >= 0 ? .green : .red)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 4) {
                    Label("\(store.streak)", systemImage: "flame.fill")
                        .font(.title2.bold())
                        .foregroundStyle(.orange)
                    Text("day streak")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            // Progress bar
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("\(store.usedBlocks)/\(kTotalBlocks) blocks")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Text(blocksToTime(store.usedBlocks))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color(.systemGray5))
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.accentColor)
                            .frame(width: geo.size.width * CGFloat(store.usedBlocks) / CGFloat(kTotalBlocks))
                    }
                }
                .frame(height: 8)
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}
