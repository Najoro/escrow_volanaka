use anchor_lang::prelude::*;
use crate::state::EscrowAccount;

#[derive(Accounts)]
pub struct InitializeEscrow<'info> {
    #[account(init, payer = seller, space = 8 + 32 + 32 + 8 + 32 + 1)] 
    pub escrow_account: Account<'info, EscrowAccount>,
    #[account(mut)]
    pub seller: Signer<'info>,
    /// CHECK: This is safe, buyer will sign later
    pub buyer: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeEscrow>,amount: u64,mint: Pubkey,) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow_account;
    escrow.seller = ctx.accounts.seller.key();
    escrow.buyer = ctx.accounts.buyer.key();
    escrow.amount = amount;
    escrow.mint = mint;
    escrow.is_initialized = true;
    msg!("Escrow initialized between seller: {:?} and buyer: {:?}", escrow.seller, escrow.buyer);
    Ok(())
}
