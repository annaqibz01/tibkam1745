use std::process::Child;
use std::sync::Mutex;

pub struct PocketbaseChild(pub Mutex<Option<Child>>);