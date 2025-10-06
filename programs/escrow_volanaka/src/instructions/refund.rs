use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Token, TokenAccount, Transfer};

use crate::state::EscrowAccount;

#[derive(Accounts)]
pub struct Refund<'info> {
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
        close = seller
    )]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"escrow", seller.key().as_ref(), escrow_account.buyer.as_ref()],
        bump,
        constraint = escrow_account.seller == seller.key(),
        close = seller
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<Refund>) -> Result<()> {
    let amount = ctx.accounts.vault.amount;

    let escrow_key = ctx.accounts.escrow_account.key();
    let seeds = &[
        b"vault",
        escrow_key.as_ref(),
        &[ctx.bumps.vault],
    ];
    let signer = &[&seeds[..]];

    // Transfer tokens from vault back to seller
    let cpi_accounts = Transfer {
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.seller_token_account.to_account_info(),
        authority: ctx.accounts.escrow_account.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, amount)?;

    // Close the vault account
    let cpi_accounts = CloseAccount {
        account: ctx.accounts.vault.to_account_info(),
        destination: ctx.accounts.seller.to_account_info(),
        authority: ctx.accounts.escrow_account.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::close_account(cpi_ctx)?;

    msg!("Escrow refunded and closed");
    Ok(())
}
