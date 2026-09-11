import UIKit
import Capacitor

class GameViewController: CAPBridgeViewController {
    override var prefersStatusBarHidden: Bool {
        return true
    }

    override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge {
        return .all
    }
}
