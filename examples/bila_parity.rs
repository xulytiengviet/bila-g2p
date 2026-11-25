use sea_g2p_rs::{g2p::G2PEngine,lang::vi::Normalizer};
fn main(){
 let path="python/sea_g2p/sea_g2p.bin";
 let engine=G2PEngine::new(path).unwrap();
 let norm=Normalizer::new("vi",Some(path));
 for s in std::env::args().skip(1){println!("{}",engine.phonemize(&norm.normalize(&s,false)));}
}
