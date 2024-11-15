import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaErrors } from "../target/types/solana_errors";
import { Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { assert } from "chai";

describe("solana-errors", () => {

  anchor.setProvider(anchor.AnchorProvider.env());
  let connection = anchor.getProvider().connection;

  const program = anchor.workspace.SolanaErrors as Program<SolanaErrors>;
  const user = Keypair.generate();
  const [data] = PublicKey.findProgramAddressSync([Buffer.from("data")], program.programId)

  before("prepare", async () => {
    await airdrop(anchor.getProvider().connection, user.publicKey)
  })

  it("Is initialized!", async () => {
    console.log("user balance = " + await connection.getBalance(user.publicKey))
    const tx = await program.methods
      .initialize(1)
      .accountsStrict({
        user: user.publicKey,
        data: data,
        systemProgram: SystemProgram.programId
      })
      .signers([user])
      .rpc({ commitment: "confirmed"});

      let dataAccount = await program.account.myData.fetch(data)
      assert.deepEqual(dataAccount.authority, user.publicKey)
      assert.deepEqual(dataAccount.counter, 9)
  });

  it("Is not initialized with incorrect data account!", async () => {
    const bad_data_account = Keypair.generate(); // not a PDA

    try {
      const tx = await program.methods
      .initialize(1)
      .accountsStrict({
        user: user.publicKey,
        data: bad_data_account.publicKey,
        systemProgram: SystemProgram.programId
      })
      .signers([user])
      .rpc();

      assert.fail("Should not pass")
    } catch(_err) {
      const err = anchor.AnchorError.parse(_err.logs);
      assert.strictEqual(err.error.errorCode.code, "ConstraintSeeds");
    }
  });
});


async function airdrop(connection: any, address: any, amount = 1000000000) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}
 