const anchor = require("@coral-xyz/anchor");
const { Connection, PublicKey, Keypair } = require("@solana/web3.js");
const fs = require("fs");

async function interactWithProgram() {
  try {
    // Connect to devnet
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    
    // Load wallet
    const walletKeypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync("app/private-keys/eqima.json", "utf8")))
    );
    
    // Setup provider
    const wallet = new anchor.Wallet(walletKeypair);
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    anchor.setProvider(provider);
    
    // Load program
    const programId = new PublicKey("Dyzh44sBUJYppZctNY1fbi25YL39PSiekUVqJYtc6jgc");
    const idl = JSON.parse(fs.readFileSync("target-1/idl/escrow_volanaka.json", "utf8"));
    const program = new anchor.Program(idl, programId, provider);
    
    console.log("🚀 Programme chargé avec succès!");
    console.log("Program ID:", programId.toString());
    console.log("Wallet:", walletKeypair.publicKey.toString());
    
    // Check wallet balance
    const balance = await connection.getBalance(walletKeypair.publicKey);
    console.log("Balance du wallet:", balance / 1e9, "SOL");
    
    if (balance < 0.01 * 1e9) {
      console.log("⚠️  Balance faible. Vous pourriez avoir besoin de plus de SOL pour les frais de transaction.");
    }
    
    console.log("\n✅ Votre programme escrow_volanaka est prêt à être utilisé!");
    console.log("Instructions disponibles:", idl.instructions.map(ix => ix.name).join(", "));
    
    // Show account structure
    console.log("\n📋 Structure du compte EscrowAccount:");
    const escrowAccountType = idl.types.find(t => t.name === "EscrowAccount");
    if (escrowAccountType) {
      escrowAccountType.type.fields.forEach(field => {
        console.log(`- ${field.name}: ${field.type}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
}

interactWithProgram();
