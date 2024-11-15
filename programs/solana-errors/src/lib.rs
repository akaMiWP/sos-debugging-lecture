#![allow(clippy::result_large_err)]
use anchor_lang::prelude::*;

declare_id!("Gp3jcr7dqCcgp3QbQdcwjS5p5n5usRLoxesQuNaHm4GD");

#[program]
pub mod solana_errors {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, count: u8) -> Result<()> {
        let data = &mut ctx.accounts.data;

        data.authority = ctx.accounts.user.key(); // Set to the public key of the user who signed the transaction.
        data.counter = math_function(count).unwrap();

        msg!("data.conter = {}", data.counter);
        msg!("data pubkey = {}", data.key().to_string()); // public key of the data account.
        msg!("user pubkey = {}", data.authority.key().to_string()); // public key of the user who initialized the account.

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    user: Signer<'info>, // Represents the user who signed the transaction.

    #[account(init,
        space = 8 + 32 + 1,
        payer = user,
        seeds = [b"data"],
        bump
    )]
    data: Account<'info, MyData>, // Represents the data account, which will store MyData on-chain.

    system_program: Program<'info, System>,
}

#[account]
pub struct MyData {
    authority: Pubkey,
    counter: u8,
}

#[error_code]
pub enum MyError {
    #[msg("invalid count value")]
    InvalidCount,
}

fn math_function(count: u8) -> Option<u8> {
    10u8.checked_sub(count)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_math_function() {
        assert_eq!(math_function(2), Some(8));
        assert_eq!(math_function(11), None);
    }
}
