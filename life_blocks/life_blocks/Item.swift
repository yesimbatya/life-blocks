//
//  Item.swift
//  life_blocks
//
//  Created by Yessimkhan Seitkarim on 07.03.2026.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
