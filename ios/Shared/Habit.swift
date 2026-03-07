import SwiftUI

// MARK: - Types

enum HabitCategory: String, Codable, CaseIterable {
    case essential
    case growth
    case drain

    var label: String {
        switch self {
        case .essential: "Blue Chips"
        case .growth: "Growth"
        case .drain: "Energy Drains"
        }
    }

    var icon: String {
        switch self {
        case .essential: "💎"
        case .growth: "📈"
        case .drain: "⚠️"
        }
    }
}

struct Habit: Identifiable, Codable, Hashable {
    let id: String
    let emoji: String
    let name: String
    let baseReturn: Double
    let hexColor: String
    let category: HabitCategory

    var color: Color {
        Color(hex: hexColor)
    }
}

// MARK: - Constants

let kTotalBlocks = 100

let kHabits: [Habit] = [
    Habit(id: "sleep", emoji: "😴", name: "Sleep", baseReturn: 8.2, hexColor: "#5E5CE6", category: .essential),
    Habit(id: "deepwork", emoji: "🎯", name: "Deep Work", baseReturn: 7.5, hexColor: "#32ADE6", category: .growth),
    Habit(id: "exercise", emoji: "🏃", name: "Exercise", baseReturn: 6.8, hexColor: "#FF9F0A", category: .essential),
    Habit(id: "reading", emoji: "📚", name: "Reading", baseReturn: 4.8, hexColor: "#BF5AF2", category: .growth),
    Habit(id: "meditate", emoji: "🧘", name: "Meditate", baseReturn: 5.2, hexColor: "#64D2FF", category: .growth),
    Habit(id: "japanese", emoji: "🇯🇵", name: "Japanese", baseReturn: 4.2, hexColor: "#FF375F", category: .growth),
    Habit(id: "build", emoji: "⚡", name: "Build", baseReturn: 6.1, hexColor: "#30D158", category: .growth),
    Habit(id: "connect", emoji: "💬", name: "Connect", baseReturn: 5.5, hexColor: "#FF6482", category: .essential),
    Habit(id: "scroll", emoji: "📱", name: "Scrolling", baseReturn: -2.1, hexColor: "#8E8E93", category: .drain),
    Habit(id: "netflix", emoji: "📺", name: "Binge", baseReturn: -1.5, hexColor: "#636366", category: .drain),
]

// MARK: - Helpers

func habitById(_ id: String) -> Habit? {
    kHabits.first { $0.id == id }
}

func habitsByCategory(_ category: HabitCategory) -> [Habit] {
    kHabits.filter { $0.category == category }
}

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        var rgbValue: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&rgbValue)
        self.init(
            red: Double((rgbValue & 0xFF0000) >> 16) / 255.0,
            green: Double((rgbValue & 0x00FF00) >> 8) / 255.0,
            blue: Double(rgbValue & 0x0000FF) / 255.0
        )
    }
}
