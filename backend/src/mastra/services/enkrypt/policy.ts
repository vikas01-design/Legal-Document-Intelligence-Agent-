export const LEGAL_POLICY = {

  prompt: {

    blockPromptInjection: true,

    blockJailbreak: true,

    blockPII: true,

    blockToxicity: true,

    blockFraud: true,

    blockCopyright: true,

    bannedKeywords: [

      "bomb",

      "terrorist",

      "malware",

      "ransomware"

    ]

  },

  output: {

    detectPII: true,

    detectUnsafeLegalAdvice: true,

    detectHallucination: true,

    detectToxicity: true

  }

};