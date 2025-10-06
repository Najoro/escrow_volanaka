use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::EscrowAccount;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,
    #[account(
        mut,
        constraint = seller_token_account.mint == escrow_account.mint
    )]
    pub seller_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"vault", escrow_account.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        seeds = [b"escrow", escrow_account.seller.as_ref(), escrow_account.buyer.as_ref()],
        bump,
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<Deposit>) -> Result<()> {
    let amount = ctx.accounts.escrow_account.amount;

    let cpi_accounts = Transfer {
        from: ctx.accounts.seller_token_account.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.seller.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    token::transfer(cpi_ctx, amount)?;

    Ok(())
}
