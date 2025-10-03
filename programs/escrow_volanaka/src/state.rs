use anchor_lang::prelude::*;

#[account]
pub struct EscrowAccount {
    pub seller: Pubkey,
    pub buyer: Pubkey,
    pub amount: u64,
    pub mint : Pubkey,
    pub is_initialized: bool,
}
