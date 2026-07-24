// エンティティID が未定義（generator の seed が空）のときはこのマクロが未使用になるため許可する。
#[allow(unused_macros)]
macro_rules! define_id {
    ($id_type: ident) => {
        #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Deserialize, Serialize, sqlx::Type)]
        #[sqlx(transparent)]
        pub struct $id_type(uuid::Uuid);
        impl $id_type {
            pub fn new() -> Self {
                Self(uuid::Uuid::new_v4())
            }
            pub fn raw(self) -> uuid::Uuid {
                self.0
            }
        }
        impl Default for $id_type {
            fn default() -> Self {
                Self::new()
            }
        }
        impl FromStr for $id_type {
            type Err = AppError;
            fn from_str(s: &str) -> Result<Self, Self::Err> {
                Ok(Self(uuid::Uuid::parse_str(s)?))
            }
        }
        impl From<uuid::Uuid> for $id_type {
            fn from(u: uuid::Uuid) -> Self {
                Self(u)
            }
        }
        impl std::fmt::Display for $id_type {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(
                    f,
                    "{}",
                    self.0
                        .as_simple()
                        .encode_lower(&mut uuid::Uuid::encode_buffer())
                )
            }
        }
        impl From<$id_type> for String {
            fn from(id: $id_type) -> Self {
                id.to_string()
            }
        }
    };
}
