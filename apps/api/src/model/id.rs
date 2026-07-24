// このファイルは generator/src/generators/entity_id.ts から生成されます。
// 直接編集しないでください。

#[allow(unused_imports)]
use crate::error::AppError;
#[allow(unused_imports)]
use serde::{Deserialize, Serialize};
#[allow(unused_imports)]
use std::str::FromStr;

#[path = "id_macro.rs"]
#[macro_use]
mod id_macro;

define_id!(UserId);
