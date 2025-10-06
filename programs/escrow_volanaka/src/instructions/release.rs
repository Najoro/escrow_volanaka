use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::EscrowAccount;

#[derive(Accounts)]
pub struct Release<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(
        mut,
        constraint = buyer_token_account.mint == escrow_account.mint
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"vault", escrow_account.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        seeds = [b"escrow", escrow_account.seller.as_ref(), buyer.key().as_ref()],
        bump,
        constraint = escrow_account.buyer == buyer.key(),
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<Release>) -> Result<()> {
    let amount = ctx.accounts.escrow_account.amount;

    let seeds = &[
        b"vault",
        ctx.accounts.escrow_account.to_account_info().key.as_ref(),
        &[ctx.bumps.vault],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.buyer_token_account.to_account_info(),
        authority: ctx.accounts.vault.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

    token::transfer(cpi_ctx, amount)?;

    Ok(())
}
