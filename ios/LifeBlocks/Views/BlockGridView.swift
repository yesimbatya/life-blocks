import SwiftUI

struct BlockGridView: View {
    @EnvironmentObject var store: BlockStore
    @Environment(\.dismiss) private var dismiss
    @State private var selectedHabit: Habit? = nil

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 3), count: 10)

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        HStack {
                            Text("\(store.usedBlocks) used")
                                .foregroundStyle(.primary)
                            Text("\u{2022}")
                                .foregroundStyle(.secondary)
                            Text("\(store.availableBlocks) left")
                                .foregroundStyle(.secondary)
                        }
                        .font(.subheadline)

                        // 10x10 grid
                        LazyVGrid(columns: columns, spacing: 3) {
                            ForEach(0..<kTotalBlocks, id: \.self) { index in
                                BlockCell(habitId: store.blocks[index], selectedHabit: selectedHabit)
                                    .onTapGesture {
                                        handleTap(at: index)
                                    }
                            }
                        }

                        HStack {
                            Text("12 AM")
                            Spacer()
                            Text("12 PM")
                            Spacer()
                            Text("11:50 PM")
                        }
                        .font(.caption2)
                        .foregroundStyle(.tertiary)

                        // Mini legend
                        MiniLegend()
                    }
                    .padding()
                }

                Divider()

                // Habit picker strip
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        // Eraser
                        Button {
                            selectedHabit = nil
                        } label: {
                            VStack(spacing: 4) {
                                Image(systemName: "eraser.fill")
                                    .font(.title2)
                                Text("Clear")
                                    .font(.caption2)
                            }
                            .frame(width: 56, height: 56)
                            .background(selectedHabit == nil ? Color(.systemGray4) : Color(.systemGray6))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        .buttonStyle(.plain)

                        ForEach(kHabits) { habit in
                            Button {
                                selectedHabit = habit
                            } label: {
                                VStack(spacing: 4) {
                                    Text(habit.emoji)
                                        .font(.title2)
                                    Text(habit.name)
                                        .font(.caption2)
                                        .lineLimit(1)
                                }
                                .frame(width: 56, height: 56)
                                .background(selectedHabit?.id == habit.id ? habit.color.opacity(0.3) : Color(.systemGray6))
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .strokeBorder(selectedHabit?.id == habit.id ? habit.color : .clear, lineWidth: 2)
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding()
                }
                .background(Color(.secondarySystemGroupedBackground))
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Schedule")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Reset") {
                        store.resetToday()
                    }
                    .foregroundStyle(.red)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .bold()
                }
            }
        }
    }

    private func handleTap(at index: Int) {
        if let habit = selectedHabit {
            store.setBlock(at: index, habitId: habit.id)
        } else {
            store.setBlock(at: index, habitId: nil)
        }
    }
}

struct BlockCell: View {
    let habitId: String?
    let selectedHabit: Habit?

    var body: some View {
        let habit = habitId.flatMap { habitById($0) }

        RoundedRectangle(cornerRadius: 3)
            .fill(habit?.color ?? Color(.systemGray5))
            .aspectRatio(1, contentMode: .fit)
            .overlay {
                if let habit {
                    Text(habit.emoji)
                        .font(.system(size: 8))
                }
            }
    }
}

struct MiniLegend: View {
    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 6) {
            ForEach(kHabits) { habit in
                HStack(spacing: 6) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(habit.color)
                        .frame(width: 12, height: 12)
                    Text(habit.name)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    Spacer()
                }
            }
        }
    }
}
