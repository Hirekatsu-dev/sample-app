//! ルーティングから呼ばれるコントローラ。
//!
//! - `generated`: generator が生成するディスパッチ層。直接編集しない。
//! - `handlers`: 初回のみ generator がスタブを生成し、以降は手で実装する層。
//! - `custom`: generator を通さない手書きのハンドラ。

pub mod custom;
pub mod generated;
pub mod handlers;
