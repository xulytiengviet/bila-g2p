//! Single-threaded browser ABI. Input buffers are caller-owned; output is borrowed until next call.
use std::{cell::RefCell, sync::Arc};
use crate::{g2p::{G2PEngine, PhonemeDict}, lang::vi::Normalizer};
thread_local! {
    static ENGINE: RefCell<Option<G2PEngine>> = const { RefCell::new(None) };
    static OUT: RefCell<Vec<u8>> = const { RefCell::new(Vec::new()) };
}
#[no_mangle]
pub extern "C" fn bila_alloc(n: usize) -> *mut u8 {
    Box::into_raw(vec![0u8; n].into_boxed_slice()) as *mut u8
}
#[no_mangle]
pub unsafe extern "C" fn bila_free(p: *mut u8, n: usize) {
    if !p.is_null() { drop(Box::from_raw(std::ptr::slice_from_raw_parts_mut(p,n))); }
}
#[no_mangle]
pub unsafe extern "C" fn bila_init(p: *const u8, n: usize) -> i32 {
    if p.is_null() || n < 32 || n > 80_000_000 { return 0; }
    if ENGINE.with(|e| e.borrow().is_some()) { return 0; }
    let data: Arc<[u8]> = Arc::from(std::slice::from_raw_parts(p,n));
    match PhonemeDict::from_bytes(data) {
        Ok(dict) => { crate::lang::vi::technical::init_norm_dict_bytes(dict.clone()); ENGINE.with(|e| *e.borrow_mut()=Some(G2PEngine::from_dict(dict))); 1 },
        Err(_) => 0
    }
}
#[no_mangle]
pub unsafe extern "C" fn bila_phonemize(p: *const u8, n: usize) -> i32 {
    if p.is_null() || n > 16384 { return 0; }
    let Ok(s) = std::str::from_utf8(std::slice::from_raw_parts(p,n)) else { return 0; };
    ENGINE.with(|e| {
        let e=e.borrow();
        let Some(engine)=e.as_ref() else { return 0; };
        let result=engine.phonemize(&Normalizer::new("vi",None).normalize(s,false));
        OUT.with(|o| *o.borrow_mut()=result.into_bytes());
        1
    })
}
#[no_mangle]
pub extern "C" fn bila_result_ptr() -> *const u8 { OUT.with(|o| o.borrow().as_ptr()) }
#[no_mangle]
pub extern "C" fn bila_result_len() -> usize { OUT.with(|o| o.borrow().len()) }
