const anchor = require("@coral-xyz/anchor");
const { Connection, PublicKey } = require("@solana/web3.js");

async function verifyDeployment() {
  try {
    // Connect to devnet
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    
    // Your deployed program ID
    const programId = new PublicKey("Dyzh44sBUJYppZctNY1fbi25YL39PSiekUVqJYtc6jgc");
    
    console.log("🔍 Vérification du déploiement...");
    console.log("Program ID:", programId.toString());
    
    // Check if program exists
    const programInfo = await connection.getAccountInfo(programId);
    
    if (programInfo) {
      console.log("✅ Programme trouvé sur devnet!");
      console.log("- Propriétaire:", programInfo.owner.toString());
      console.log("- Taille des données:", programInfo.data.length, "bytes");
      console.log("- Lamports:", programInfo.lamports);
      
      // Check if it's executable
      if (programInfo.executable) {
        console.log("✅ Le programme est exécutable");
      } else {
        console.log("❌ Le programme n'est pas exécutable");
      }
      
      // Try to load the IDL
      try {
        const provider = anchor.AnchorProvider.local("https://api.devnet.solana.com");
        anchor.setProvider(provider);
        
        const idl = await anchor.Program.fetchIdl(programId, provider);
        if (idl) {
          console.log("✅ IDL trouvé et chargé");
          console.log("- Instructions disponibles:", idl.instructions.map(ix => ix.name).join(", "));
        }
      } catch (idlError) {
        console.log("⚠️  IDL non trouvé ou erreur de chargement:", idlError.message);
      }
      
    } else {
      console.log("❌ Programme non trouvé sur devnet");
    }
    
  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error.message);
  }
}

verifyDeployment();
