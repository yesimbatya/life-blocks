import SwiftUI
import Charts

struct HistoryView: View {
    @EnvironmentObject var store: BlockStore
    @EnvironmentObject var settingsStore: SettingsStore
    @State private var selectedDay: DayData?

    private var history: [DayData] { store.history }

    var body: some View {
        NavigationStack {
            ScrollView {
                if history.isEmpty {
                    emptyState
                } else {
                    VStack(spacing: 16) {
                        statsGrid
                        weeklyChart
                        calendarHeatMap
                        selectedDayDetail
                        categoryBreakdown
                        topHabitsList
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 100)
                }
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("History")
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 16) {
            Spacer()
            Text("📈")
                .font(.system(size: 64))
            Text("No history yet")
                .font(.title2.bold())
            Text("Complete your first day of scheduling to start seeing trends and analytics here.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Spacer()
        }
        .padding(40)
    }

    // MARK: - Stats Grid

    private var statsGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            StatCard(title: "7-Day Avg", value: String(format: "%+.0f%%", averageReturn(history, days: 7)), color: averageReturn(history, days: 7) >= 0 ? .green : .red)
            StatCard(title: "All-Time Avg", value: String(format: "%+.0f%%", averageReturn(history)), color: averageReturn(history) >= 0 ? .green : .red)
            StatCard(title: "Current Streak", value: "🔥 \(store.streak)", color: .primary)
            StatCard(title: "Best Streak", value: "🏆 \(longestStreak(history))", color: .primary)
        }
    }

    // MARK: - Weekly Chart

    private var weeklyChart: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Weekly Returns")
                .font(.headline)

            let last7 = Array(history.suffix(7))

            if #available(iOS 16.0, *) {
                Chart(last7, id: \.date) { day in
                    BarMark(
                        x: .value("Day", String(day.date.suffix(5))),
                        y: .value("Return", day.totalReturn)
                    )
                    .foregroundStyle(day.totalReturn >= 0 ? Color.green : Color.red)
                }
                .frame(height: 150)
            } else {
                Text("Charts require iOS 16+")
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Calendar Heat Map

    private var calendarHeatMap: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Last 30 Days")
                .font(.headline)

            let days = calendarDays()
            let columns = Array(repeating: GridItem(.flexible(), spacing: 4), count: 7)

            // Day labels
            LazyVGrid(columns: columns, spacing: 4) {
                ForEach(["S", "M", "T", "W", "T", "F", "S"], id: \.self) { d in
                    Text(d)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                        .frame(maxWidth: .infinity)
                }
            }

            if let firstDay = days.first {
                LazyVGrid(columns: columns, spacing: 4) {
                    // Padding for day-of-week alignment
                    ForEach(0..<firstDay.dayOfWeek, id: \.self) { _ in
                        Color.clear.aspectRatio(1, contentMode: .fit)
                    }

                    ForEach(days, id: \.date) { day in
                        let ret = day.data?.totalReturn ?? 0
                        let hasData = day.data != nil

                        RoundedRectangle(cornerRadius: 4)
                            .fill(cellColor(hasData: hasData, ret: ret))
                            .aspectRatio(1, contentMode: .fit)
                            .overlay(
                                RoundedRectangle(cornerRadius: 4)
                                    .strokeBorder(selectedDay?.date == day.date ? Color.accentColor : .clear, lineWidth: 2)
                            )
                            .onTapGesture {
                                selectedDay = day.data
                            }
                    }
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Selected Day Detail

    @ViewBuilder
    private var selectedDayDetail: some View {
        if let day = selectedDay {
            VStack(alignment: .leading, spacing: 12) {
                let dateLabel = formatDate(day.date)
                Text(dateLabel)
                    .font(.headline)

                HStack {
                    Text(String(format: "%+.0f%%", day.totalReturn))
                        .font(.title.bold())
                        .foregroundStyle(day.totalReturn >= 0 ? .green : .red)
                    Spacer()
                    Text("🔥 \(day.streak) day streak")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                let allocs = blocksToAllocations(day.blocks)
                let multiplier = calculateMultiplier(streak: day.streak)

                ForEach(allocs.sorted(by: { $0.value > $1.value }), id: \.key) { habitId, blocks in
                    if let habit = habitById(habitId, from: settingsStore.allHabits) {
                        HStack {
                            Text(habit.emoji)
                            Text(habit.name)
                                .font(.subheadline)
                            Spacer()
                            Text(blocksToTime(blocks))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            let ret = calculateHabitReturn(habit: habit, blocks: blocks, multiplier: multiplier)
                            Text(String(format: "%+.1f%%", ret))
                                .font(.caption.bold())
                                .foregroundStyle(ret >= 0 ? .green : .red)
                        }
                    }
                }
            }
            .padding()
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }

    // MARK: - Category Breakdown

    private var categoryBreakdown: some View {
        let dist = categoryDistribution(history, allHabits: settingsStore.allHabits)

        return VStack(alignment: .leading, spacing: 8) {
            Text("Category Mix")
                .font(.headline)

            HStack(spacing: 16) {
                CategoryBar(label: "💎 Blue Chips", pct: dist.essential, color: .blue)
                CategoryBar(label: "📈 Growth", pct: dist.growth, color: .green)
                CategoryBar(label: "⚠️ Drains", pct: dist.drain, color: .red)
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Top Habits

    private var topHabitsList: some View {
        let top = topHabits(history, allHabits: settingsStore.allHabits, limit: 5)

        return VStack(alignment: .leading, spacing: 8) {
            Text("Most Invested")
                .font(.headline)

            ForEach(top) { entry in
                HStack {
                    Text(entry.habit.emoji)
                        .font(.title3)
                    VStack(alignment: .leading) {
                        Text(entry.habit.name)
                            .font(.subheadline.bold())
                        Text(String(format: "avg %.1f blocks/day", entry.avgBlocks))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Text("\(blocksToTime(entry.totalBlocks)) total")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Helpers

    struct CalendarDay {
        let date: String
        let data: DayData?
        let dayOfWeek: Int
    }

    private func calendarDays() -> [CalendarDay] {
        var days: [CalendarDay] = []
        let today = Date()
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"

        for i in stride(from: 29, through: 0, by: -1) {
            guard let d = Calendar.current.date(byAdding: .day, value: -i, to: today) else { continue }
            let dateStr = formatter.string(from: d)
            let dayData = history.first { $0.date == dateStr }
            let dayOfWeek = Calendar.current.component(.weekday, from: d) - 1 // 0=Sunday

            days.append(CalendarDay(date: dateStr, data: dayData, dayOfWeek: dayOfWeek))
        }

        return days
    }

    private func cellColor(hasData: Bool, ret: Double) -> Color {
        guard hasData else { return Color(.systemGray5) }
        if ret > 200 { return Color.green }
        if ret > 100 { return Color.green.opacity(0.7) }
        if ret > 0 { return Color.green.opacity(0.4) }
        if ret == 0 { return Color(.systemGray5) }
        return Color.red.opacity(0.4)
    }

    private func formatDate(_ dateStr: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: dateStr) else { return dateStr }
        formatter.dateFormat = "EEEE, MMMM d"
        return formatter.string(from: date)
    }
}

// MARK: - Subviews

struct StatCard: View {
    let title: String
    let value: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
            Text(value)
                .font(.title2.bold())
                .foregroundStyle(color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct CategoryBar: View {
    let label: String
    let pct: Double
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text(String(format: "%.0f%%", pct))
                .font(.headline.bold())
                .foregroundStyle(color)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}
