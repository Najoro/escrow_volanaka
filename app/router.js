import dotenv from "dotenv";
import express from "express";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import BN from "bn.js";
import fs from "fs";

dotenv.config(); // ✅ Charger .env
const router = express.Router();

// ✅ Configuration du provider avec retry logic
const connection = new Connection(process.env.ANCHOR_PROVIDER_URL || "https://api.devnet.solana.com", {
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 60000,
});


router.get("/teste", async(req, res) => {
  res.status(200).json({
    message : "yes"
  })
})

router.post("/init", async (req, res) => {
  try {
    // Configuration manuelle du provider
    const wallet = new anchor.Wallet(
      Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(process.env.ANCHOR_WALLET, 'utf8')))
      )
    );
    
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });
    
    anchor.setProvider(provider);
    
    // Essayer d'utiliser le workspace d'abord
    let program;
    try {
      program = anchor.workspace.escrowVolanaka;
      console.log("Using workspace program");
    } catch (workspaceError) {
      console.log("Workspace not available, loading IDL manually");
      // Fallback: charger le programme avec l'IDL manuellement
      const programId = new PublicKey("Dyzh44sBUJYppZctNY1fbi25YL39PSiekUVqJYtc6jgc");
      const idl = JSON.parse(fs.readFileSync("target/idl/escrow_volanaka.json", 'utf8'));
      
      // Vérifier que l'IDL a la bonne structure
      console.log("IDL loaded:", idl.metadata?.name);
      console.log("Instructions:", idl.instructions?.map(i => i.name));
      
      program = new anchor.Program(idl, programId, provider);
    }
    const { sellerSecret, buyerPubkey, mintPubkey, amount } = req.body;

    const seller = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(sellerSecret)));
    const buyer = new PublicKey(buyerPubkey);
    const mint = new PublicKey(mintPubkey);
    const escrowAccount = Keypair.generate();
    const amountBN = new BN(amount.toString());
    console.log("seller  :", seller.publicKey.toBase58());
    console.log("buyer   :", buyer.toBase58());
    console.log("mint    :", mint.toBase58());
    console.log("amount  :", amount);

    // Test de connexion
    console.log("Testing connection to devnet...");
    const slot = await connection.getSlot();
    console.log("Current slot:", slot);

    console.log("Escrow initialized with account:", escrowAccount.publicKey.toBase58());
    const tx = await program.methods
      .initialize(amountBN, mint)
      .accounts({
        escrowAccount: escrowAccount.publicKey,
        seller: seller.publicKey,
        buyer: buyer,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([escrowAccount, seller])
      .rpc();

    console.log("tx : ", tx)
    res.json({
      success: true,
      seller : seller.publicKey,
      buyer: buyer,
      escrowAccount: escrowAccount.publicKey.toBase58(),
      token_mint :  mint,
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
