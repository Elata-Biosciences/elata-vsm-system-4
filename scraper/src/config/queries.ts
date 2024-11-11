/**
 * Queries to search for in NewsAPI.
 * @see Documentation {@link https://newsapi.org/docs/endpoints/everything}
 */
export const QUERIES = [
    // Research News (Removed generic terms, focused on neuroscience)
    `"Neuropsychiatry" OR "Neuropharmacology" OR "Molecular psychiatry" OR "Translational neuroscience" OR "Neural circuits" OR "Cognitive neuroscience" OR "Behavioral neuroscience" OR "Brain plasticity" OR "Psychiatric genomics" OR "Neurotransmitter systems" OR "Synaptic regulation"`,
    
    // Industry News (Focused on CNS-specific companies)
    `"Boehringer Ingelheim CNS" OR "Bionomics" OR "Azevan" OR "Cerevel" OR "SK Life Sciences" OR "Atai Life Sciences" OR "Neurocrine" OR "Minerva Neurosciences" OR "Sage Therapeutics" OR "Karuna" OR "Axsome" OR "Intra-Cellular" OR "Alkermes" OR "Acadia Pharmaceuticals" OR "Praxis Precision" OR "Relmada"`,
    
    // Drug Development (Focused on specific compounds and mechanisms)
    `"BI 1358894" OR "BNC-210" OR "PRAX-114" OR "JZP-150" OR "NYV-783" OR "SRX246" OR "TNX-102" OR "Darigabat" OR "JNJ-61393215" OR "Brexpiprazole" OR "Riluzole" OR "CVL-354" OR "Rapid-acting antidepressant" OR "NMDA receptor" OR "GABA modulator" OR "5-HT receptor" OR "Kappa opioid" OR "Vasopressin antagonist"`,
    
    // Biohacking Mental Health (Focused on specific compounds/approaches)
    `"Selank" OR "Semax" OR "BPC-157" OR "Cerebrolysin" OR "P21 peptide" OR "Dihexa" OR "NSI-189" OR "9-ME-BC" OR "Noopept" OR "RG3" OR "NA-Selank" OR "FGL peptide" OR "Cortexin" OR "KPV peptide" OR "DSIP peptide" OR "Epitalon" OR "Thymalin" OR "GHK-Cu" OR "Delta sleep peptide"`,
    
    // Computational & Precision Psychiatry (Focused on specific technologies)
    `"Precision Psychiatry" OR "Computational Psychiatry" OR "Digital phenotyping" OR "Psychiatric biomarker" OR "Network psychiatry" OR "Machine learning psychiatry" OR "AI psychiatry" OR "Psychiatric algorithms" OR "Brain connectivity analysis" OR "Neuroimaging biomarkers" OR "Computational neurobiology"`,
    
    // Hardware & Neuroimaging (Specific technologies)
    `"Brain-computer interface" OR "Neural interface" OR "fMRI depression" OR "PET imaging psychiatry" OR "Neuroimaging biomarkers" OR "MEG psychiatry" OR "DTI depression" OR "Neurolink" OR "Kernel" OR "Synchron" OR "Closed-loop neural" OR "Brain stimulation depression" OR "Optogenetics psychiatry" OR "NIRS imaging psychiatry"`,
    
    // DeSci & Web3 (Specific to science DAOs)
    `"DeSci" OR "VitaDAO" OR "PsyDAO" OR "LabDAO" OR "Bio.xyz" OR "IP-NFT" OR "Science DAO" OR "Research DAO" OR "CerebrumDAO" OR "AthenaDAO" OR "Zuzalu" OR "Molecule Protocol" OR "DeSci Labs" OR "ResearchHub" OR "OpenCures" OR "DeSci Foundation" OR "Blockchain research" OR "quadratic voting" OR "Tokenomics" OR "Holographic Consensus"`,
    
    // Biomarkers & Mechanisms (Specific to psychiatric mechanisms)
    `"GABA depression" OR "Serotonin anxiety" OR "Dopamine anhedonia" OR "HPA axis stress" OR "Neuroinflammation depression" OR "Gut-brain psychiatry" OR "Microbiome depression" OR "Synaptic plasticity depression" OR "Neural oscillations anxiety" OR "Default mode network" OR "Salience network psychiatry"`,

    // Off Topic Curiosities (Fixed syntax and quotes)
    `"Dont die" OR "Biohacking" OR "Zuzalu" OR "Oxytocin" OR "Lions Mane" OR "Methylene blue" OR "infrared" OR "Quadratic Voting" OR "Tokenized research" OR "Smart Contracts" OR "Smart Drugs" OR "On-chain governance" OR "Red light therapy" OR "Mitochondrial function" OR "Near infrared" OR "Sauna" OR "Cold exposure" OR "Circadian rhythm" OR "Peak performance" OR "Flow state"`,
];
