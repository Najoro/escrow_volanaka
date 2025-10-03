use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("Dyzh44sBUJYppZctNY1fbi25YL39PSiekUVqJYtc6jgc");

#[program]
pub mod escrow_volanaka {
    use super::*;

    pub fn initialize(
        ctx: Context<InitializeEscrow>,
        amount: u64,
        mint: Pubkey,
    ) -> Result<()> {
        instructions::initialize::handler(ctx, amount, mint)
    }
}
