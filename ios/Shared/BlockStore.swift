import Foundation
import Combine

private let appGroupID = "group.com.lifeblocks.shared"
private let storageKey = "life-blocks-data"

struct StoredData: Codable {
    var currentDate: String
    var blocks: [String?]
    var streak: Int

    static func empty() -> StoredData {
        StoredData(
            currentDate: todayString(),
            blocks: Array(repeating: nil, count: kTotalBlocks),
            streak: 1
        )
    }
}

class BlockStore: ObservableObject {
    @Published var blocks: [String?]
    @Published var streak: Int
    private var currentDate: String

    var allocations: Allocations {
        blocksToAllocations(blocks)
    }

    var usedBlocks: Int {
        countUsedBlocks(blocks)
    }

    var availableBlocks: Int {
        kTotalBlocks - usedBlocks
    }

    init() {
        let data = Self.loadData()
        self.blocks = data.blocks
        self.streak = data.streak
        self.currentDate = data.currentDate
    }

    func addBlock(habitId: String) {
        guard availableBlocks > 0 else { return }
        if let idx = blocks.firstIndex(where: { $0 == nil }) {
            blocks[idx] = habitId
            save()
        }
    }

    func removeBlock(habitId: String) {
        if let idx = blocks.lastIndex(where: { $0 == habitId }) {
            blocks[idx] = nil
            save()
        }
    }

    func addBlocks(habitId: String, count: Int) {
        for _ in 0..<count {
            guard availableBlocks > 0 else { return }
            if let idx = blocks.firstIndex(where: { $0 == nil }) {
                blocks[idx] = habitId
            }
        }
        save()
    }

    func setBlock(at index: Int, habitId: String?) {
        guard index >= 0, index < kTotalBlocks else { return }
        blocks[index] = habitId
        save()
    }

    func resetToday() {
        blocks = Array(repeating: nil, count: kTotalBlocks)
        save()
    }

    // MARK: - Persistence

    private func save() {
        let data = StoredData(currentDate: currentDate, blocks: blocks, streak: streak)
        guard let encoded = try? JSONEncoder().encode(data) else { return }
        Self.defaults.set(encoded, forKey: storageKey)
    }

    private static var defaults: UserDefaults {
        UserDefaults(suiteName: appGroupID) ?? .standard
    }

    static func loadData() -> StoredData {
        guard let data = defaults.data(forKey: storageKey),
              var stored = try? JSONDecoder().decode(StoredData.self, from: data) else {
            return .empty()
        }

        let today = todayString()
        if stored.currentDate != today {
            let wasYesterday = isYesterday(stored.currentDate)
            stored = StoredData(
                currentDate: today,
                blocks: Array(repeating: nil, count: kTotalBlocks),
                streak: wasYesterday ? stored.streak + 1 : 1
            )
            if let encoded = try? JSONEncoder().encode(stored) {
                defaults.set(encoded, forKey: storageKey)
            }
        }

        return stored
    }
}
