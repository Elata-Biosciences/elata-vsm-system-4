/**
 * Sources to scrape for news articles.
 */
type ScrapingSource = {
  url: string;
  name: string;
};

export const SCRAPING_SOURCES: ScrapingSource[] = [
  {
    url: "https://pharmatimes.com/",
    name: "Pharma Times",
  },
  {
    url: "https://www.fiercepharma.com/",
    name: "Fierce Pharma",
  },
  {
    url: "https://www.statnews.com/",
    name: "STAT News",
  },
  {
    url: "https://www.pharmexec.com/",
    name: "Pharmaceutical Executive",
  },
  {
    url: "https://www.medscape.com/psychiatry",
    name: "Medscape Psychiatry",
  },
  {
    url: "https://psychnews.psychiatryonline.org/",
    name: "Psychiatric News",
  },
  {
    url: "https://www.healio.com/cme/psychiatry",
    name: "Healio Psychiatry",
  },
  {
    url: "https://www.medpagetoday.com/",
    name: "MedPage Today",
  },
  {
    url: "https://endpts.com/",
    name: "Endpoints News",
  },
  {
    url: "https://www.biopharmadive.com/",
    name: "BioPharma Dive",
  },
  {
    url: "https://www.pharmaceutical-technology.com/",
    name: "Pharmaceutical Technology",
  },
  {
    url: "https://www.nature.com/neuro/",
    name: "Nature Neuroscience",
  },
  {
    url: "https://www.cell.com/neuron/home",
    name: "Cell Neuron",
  },
  {
    url: "https://www.cell.com/newsroom",
    name: "Cell Newsroom",
  },
  {
    url: "https://www.jneurosci.org/content/early/recent",
    name: "Journal of Neuroscience",
  },
  {
    url: "https://www.frontiersin.org/journals/computational-neuroscience/articles",
    name: "Frontiers in Computational Neuroscience",
  },
  {
    url: "https://www.frontiersin.org/journals/neuroscience",
    name: "Frontiers in Neuroscience",
  },
  {
    url: "https://www.frontiersin.org/journals/neuroscience/sections/brain-imaging-methods",
    name: "Frontiers in Neuroscience - Brain Imaging Methods",
  },
  {
    url: "https://www.frontiersin.org/journals/neuroscience/sections/gut-brain-axis",
    name: "Frontiers in Neuroscience - Gut Brain Axis",
  },
  {
    url: "https://www.frontiersin.org/journals/neuroscience/sections/translational-neuroscience",
    name: "Frontiers in Neuroscience - Translational Neuroscience",
  },
  {
    url: "https://www.frontiersin.org/journals/aging-neuroscience",
    name: "Frontiers in Neuroscience - Aging Neuroscience",
  },
  {
    url: "https://www.frontiersin.org/articles",
    name: "Frontiers",
  },
  {
    url: "https://www.nature.com/tp/",
    name: "Nature Translational Psychiatry",
  },
  {
    url: "https://www.medpagetoday.com/neurology",
    name: "MedPage Today Neurology",
  },
  {
    url: "https://www.medpagetoday.com/psychiatry",
    name: "MedPage Today Psychiatry",
  },
  {
    url: "https://www.medpagetoday.com/radiology",
    name: "MedPage Today Radiology",
  },
  {
    url: "https://www.coindesk.com/",
    name: "CoinDesk",
  },
  {
    url: "https://decrypt.co/",
    name: "Decrypt",
  },
  {
    url: "https://thedefiant.io/",
    name: "The Defiant",
  },
  {
    url: "https://www.molecule.xyz/blog",
    name: "molocule.xyz",
  },
  {
    url: "https://arxiv.org/list/q-bio.NC/new",
    name: "arXiv Neurons and Cognition",
  },
  {
    url: "https://arxiv.org/list/q-bio.QM/new",
    name: "arXiv Quantitative Methods",
  },
  {
    url: "https://arxiv.org/list/q-bio.BM/new",
    name: "arXiv Biomolecules",
  },
  {
    url: "https://arxiv.org/list/q-bio.GN/new",
    name: "arXiv Genomics",
  },
  {
    url: "https://arxiv.org/list/cs.AI/recent",
    name: "arXiv Artificial Intelligence",
  },
  {
    url: "https://arxiv.org/list/cs.CV/recent",
    name: "arXiv Computer Vision and Pattern Recognition",
  },
  {
    url: "https://arxiv.org/list/cs.DC/recent",
    name: "arXiv Distributed, Parallel, and Cluster Computing",
  },
  {
    url: "https://arxiv.org/list/cs.SC/recent",
    name: "arXiv Symbolic Computation",
  },
  {
    url: "https://arxiv.org/list/cs.SY/recent",
    name: "arXiv Systems and Control",
  },
  {
    url: "https://arxiv.org/list/eess.BM/recent",
    name: "arXiv Biomedical Engineering",
  },
  {
    url: "https://arxiv.org/list/eess.SP/recent",
    name: "arXiv Signal Processing",
  },
  {
    url: "https://arxiv.org/list/cs.HC/recent",
    name: "arXiv Human-Computer Interaction",
  },
  {
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=precision+psychiatry&sort=date",
    name: "PubMed Precision Psychiatry",
  },
  {
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=Brain+Computer+Interface&sort=date",
    name: "PubMed Brain Computer Interface",
  },
  {
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=EEG&sort=date",
    name: "PubMed EEG",
  },
  {
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=fNIRS&sort=date",
    name: "PubMed fNIRS",
  },
  {
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=rPPG&sort=date",
    name: "PubMed rPPG",
  },
  {
    url: "https://elifesciences.org/",
    name: "eLife Sciences",
  },
  {
    url: "https://www.science.org/",
    name: "Science",
  },
  {
    url: "https://elifesciences.org/subjects/neuroscience",
    name: "eLife Sciences Neuroscience",
  },
  {
    url: "https://elifesciences.org/subjects/computational-systems-biology",
    name: "eLife Sciences Computational Systems Biology",
  },
  {
    url: "https://elifesciences.org/subjects/biochemistry-chemical-biology",
    name: "eLife Sciences Biochemistry and Chemical Biology",
  },
  {
    url: "https://elifesciences.org/subjects/genetics-genomics",
    name: "eLife Sciences Genetics and Genomics",
  },
  {
    url: "https://elifesciences.org/subjects/structural-biology-molecular-biophysics",
    name: "eLife Sciences Structural Biology and Molecular Biophysics",
  },
  {
    url: "https://elifesciences.org/subjects/stem-cells-regenerative-medicine",
    name: "eLife Sciences Stem Cells and Regenerative Medicine",
  },
  {
    url: "https://www.pnas.org/latest",
    name: "Proceedings of the National Academy of Sciences",
  },
  {
    url: "https://www.thelancet.com/journals/lanpsy/onlinefirst",
    name: "The Lancet Psychiatry",
  },
  {
    url: "https://www.sciencedirect.com/search?qs=precision%20psychiatry&sortBy=date",
    name: "ScienceDirect Precision Psychiatry",
  },
  {
    url: "https://www.rand.org/topics/cyber-and-data-sciences.html",
    name: "RAND Cyber and Data Sciences",
  },
  {
    url: "https://www.rand.org/topics/health-health-care-and-aging.html",
    name: "RAND Health, Health Care, and Aging",
  },
  {
    url: "https://www.rand.org/topics/artificial-intelligence.html",
    name: "RAND Artificial Intelligence",
  },
  {
    url: "https://www.astralcodexten.com/",
    name: "Astral Codex Ten",
  },
  {
    url: "https://vitalik.eth.limo/",
    name: "Vitalik Buterin",
  },
  {
    url: "https://www.fiercebiotech.com/medtech",
    name: "Fierce Biotech",
  },
  {
    url: "https://psychedelicalpha.com/insights",
    name: "Psychedelic Alpha",
  },
  {
    url: "https://www.bankless.com/read",
    name: "Bankless",
  },
  {
    url: "https://www.theblock.co",
    name: "The Block",
  },
  {
    url: "https://brain.harvard.edu/news/",
    name: "Harvard Brain",
  },
  {
    url: "https://www.nami.org/about-nami/nami-news/",
    name: "NAMI News",
  },
  {
    url: "https://www.nimh.nih.gov/news/science-news",
    name: "NIH Science News",
  },
  {
    url: "https://www.nimh.nih.gov/news/media",
    name: "NIH Media",
  },
  {
    url: "https://www.mentalhealth.org.uk/about-us/news",
    name: "Mental Health UK News",
  },
  {
    url: "https://www.nature.com/subjects/chemistry/nature",
    name: "Nature Chemistry",
  },
  {
    url: "https://www.nature.com/subjects/mathematics-and-computing/nature",
    name: "Nature Mathematics and Computing",
  },
  {
    url: "https://www.nature.com/subjects/engineering/nature",
    name: "Nature Engineering",
  },
  {
    url: "https://www.nature.com/subjects/biogeochemistry/nature",
    name: "Nature Biogeochemistry",
  },
  {
    url: "https://www.nature.com/subjects/genetics/nature",
    name: "Nature Genetics",
  },
  {
    url: "https://www.nature.com/subjects/biochemistry/nature",
    name: "Nature Biochemistry",
  },
  {
    url: "https://www.nature.com/subjects/biotechnology/nature",
    name: "Nature Biotechnology",
  },
  {
    url: "https://www.nature.com/subjects/drug-discovery/nature",
    name: "Nature Drug Discovery",
  },
  {
    url: "https://www.nature.com/subjects/stem-cells/nature",
    name: "Nature Stem Cells",
  },
  {
    url: "https://www.nature.com/subjects/computational-biology-and-bioinformatics/nature",
    name: "Nature Computational Biology and Bioinformatics",
  },
  {
    url: "https://www.nature.com/subjects/psychology/nature",
    name: "Nature Psychology",
  },
  {
    url: "https://www.nature.com/subjects/biophysics/nature",
    name: "Nature Biophysics",
  },
  {
    url: "https://www.nature.com/subjects/chemical-biology/nature",
    name: "Nature Chemical Biology",
  },
  {
    url: "https://www.nature.com/subjects/systems-biology/nature",
    name: "Nature Systems Biology",
  },
  {
    url: "https://www.nature.com/subjects/health-care/nature",
    name: "Nature Health Care",
  },
  {
    url: "https://www.nature.com/subjects/neurology/nature",
    name: "Nature Neurology",
  },
  {
    url: "https://academic.oup.com/cercor/advance-articles",
    name: "Academic OUP",
  },
  {
    url: "https://www.brainpost.co/recent-posts",
    name: "Brain Post",
  },
  {
    url: "https://www.thetransmitter.org/spectrum/?fspec=1",
    name: "The Transmitter Spectrum",
  },
  {
    url: "https://www.thetransmitter.org/computational-neuroscience/",
    name: "The Transmitter Computational Neuroscience",
  },
  {
    url: "https://www.thetransmitter.org/open-neuroscience-and-data-sharing/",
    name: "The Transmitter Open Neuroscience and Data Sharing",
  },
  {
    url: "https://www.thetransmitter.org/brain-imaging/",
    name: "The Transmitter Brain Imaging",
  },
  {
    url: "https://www.thetransmitter.org/from-bench-to-bot/",
    name: "The Transmitter From Bench to Bot",
  },
  {
    url: "https://alleninstitute.org/publications/",
    name: "Allen Institute Publications",
  },
  {
    url: "https://www.nature.com/nm/",
    name: "Nature Medicine",
  },
  {
    url: "https://www.nature.com/mp/",
    name: "Nature Neuroscience",
  },
  {
    url: "https://bengreenfieldlife.com/all-posts",
    name: "Ben Greenfield Life",
  },
  {
    url: "https://www.foundmyfitness.com/episodes",
    name: "Found My Fitness",
  },
  {
    url: "https://www.psychologytoday.com/us",
    name: "Psychology Today",
  },
  {
    url: "https://www.psypost.org/",
    name: "PsyPost",
  },
  {
    url: "https://www.psypost.org/exclusive/cognition/",
    name: "PsyPost Cognition",
  },
  {
    url: "https://www.psypost.org/exclusive/drugs/",
    name: "PsyPost Drugs",
  },
  {
    url: "https://www.psypost.org/exclusive/neuroimaging/",
    name: "PsyPost Neuroimaging",
  },
  {
    url: "https://neurosciencenews.com/neuroscience-topics/neuroscience/",
    name: "Neuroscience News Neuroscience",
  },
  {
    url: "https://neurosciencenews.com/neuroscience-topics/neurology/",
    name: "Neuroscience News Neurology",
  },
  {
    url: "https://neurosciencenews.com/neuroscience-topics/psychology/",
    name: "Neuroscience News Psychology",
  },
  {
    url: "https://neurosciencenews.com/neuroscience-topics/artificial-intelligence/",
    name: "Neuroscience News Artificial Intelligence",
  },
  {
    url: "https://neurosciencenews.com/neuroscience-topics/robotics/",
    name: "Neuroscience News Robotics",
  },
  {
    url: "https://neurosciencenews.com/neuroscience-topics/neurotech/",
    name: "Neuroscience News Neurotech",
  },
  {
    url: "https://www.quantamagazine.org/biology/",
    name: "Quanta Magazine Biology",
  },
  {
    url: "https://www.quantamagazine.org/computer-science/",
    name: "Quanta Magazine Computer Science",
  },
  {
    url: "https://www.sciencedaily.com/news/mind_brain/neuroscience/",
    name: "Science Daily Neuroscience",
  },
  {
    url: "https://spectrum.ieee.org/topic/artificial-intelligence/",
    name: "IEEE Spectrum Artificial Intelligence",
  },
  {
    url: "https://arstechnica.com/ai/",
    name: "Ars Technica AI",
  },
  {
    url: "https://arstechnica.com/health/",
    name: "Ars Technica Health",
  },
  {
    url: "https://arstechnica.com/",
    name: "Ars Technica",
  },
  {
    url: "https://techcrunch.com/category/venture/",
    name: "TechCrunch Venture",
  },
  {
    url: "https://techcrunch.com/latest/",
    name: "TechCrunch Latest",
  },
  {
    url: "https://portal.brain-map.org/latest-data-release",
    name: "Brain Map Latest Data Release",
  },
  {
    url: "https://wysscenter.ch/updates/",
    name: "Wyss Center Updates",
  },
  {
    url: "https://www.humanbrainproject.eu/en/follow-hbp/news/category/press-release/",
    name: "Human Brain Project Press Releases",
  },
  {
    url: "https://singularityhub.com/",
    name: "Singularity Hub",
  },
  {
    url: "https://www.nejm.org/",
    name: "New England Journal of Medicine",
  },
  {
    url: "https://www.nature.com/npp/",
    name: "Nature Neuropsychopharmacology",
  },
  {
    url: "https://neuralink.com/blog/",
    name: "Neuralink Blog",
  },
  {
    url: "https://openbci.com/blog",
    name: "OpenBCI Blog",
  },
  {
    url: "https://medium.com/neurotechx",
    name: "NeuroTechX Medium",
  },
  {
    url: "https://blackrockneurotech.com/news/",
    name: "Blackrock Neurotech News",
  },
  {
    url: "https://www.massgeneral.org/psychiatry/news",
    name: "Mass General Psychiatry News",
  },
  {
    url: "https://neuroscience.stanford.edu/news",
    name: "Stanford Neuroscience News",
  },
  {
    url: "https://zuckermaninstitute.columbia.edu/news?year%5Bvalue%5D%5Byear%5D=&area=All",
    name: "Columbia Zuckerman Institute News",
  },
  {
    url: "https://www.hopkinsmedicine.org/psychiatry/about/news#brainwise",
    name: "Hopkins Psychiatry News",
  },
  {
    url: "https://neuroscience.berkeley.edu/news",
    name: "Berkeley Neuroscience News",
  },
  {
    url: "https://www.salk.edu/news/salk-news/",
    name: "Salk News",
  },
  {
    url: "https://www.hubermanlab.com/all-episodes",
    name: "Huberman Lab",
  },
  {
    url: "https://substack.com/search/neuroscience?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/psychology%20?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Biology%20?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Biochemistry%20?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/DeSci?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/DAO?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Crypto?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Biohacking?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Mental%20Health?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Pharma?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Ethereum?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Governance%20?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Depression?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Anxiety%20?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/PTSD?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Schizophrenia%20?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Bipolar?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/ADHD?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/OCD?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Autism?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Psychedelic%20?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/BCI?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Brain%20Computer%20Interface?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/meditation%20?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/mindfullness?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Biotech?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Machine%20Learning?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/ZKP?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://review.stanfordblockchain.xyz/",
    name: "Stanford Blockchain Review",
  },
  {
    url: "https://thefrontierpsychiatrists.substack.com/",
    name: "The Frontier Psychiatrists",
  },
  {
    url: "https://substack.com/search/Vitalik%20Buterin?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/blockchain?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Effective%20Accelerationism%20%20?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Rust?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Python?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Pytorch%20?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/TypeScript?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Machine%20Learning?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Computer%20Vision?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/solidity?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/cryptography?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/NIH?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Longevity?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/stem%20cell?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://www.asimov.press/",
    name: "Asimov Press",
  },
  {
    url: "https://neurotechnology.substack.com",
    name: "Neurotech Insider Substack",
  },
  {
    url: "https://substack.com/search/hyperbaric?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/RFK?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/diffusion%20model?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/prediction%20market?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Raspberry%20Pi?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Arduino?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://wublock.substack.com/",
    name: "Wu Blockchain",
  },
  {
    url: "https://substack.com/search/healthcare?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Biopharma?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Open%20Source?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/web3?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/cognitive%20behavioral%20therapy?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/breathwork?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/biomarker?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Solana?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/zkSync?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/DeFi?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Bitcoin?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Coinbase?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Eliptic%20Curve?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/LLM?searching=all_posts&language=en ",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/alphafold?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Decentralized?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Consensus%20?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/IP-NFT%20?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/NFT%20?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/ERC?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Personalized%20Medicine%20?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://substack.com/search/Deep%20Learning?searching=all_posts&language=en",
    name: "Substack",
  },
  {
    url: "https://www.lesswrong.com/allPosts",
    name: "Less Wrong",
  },
  {
    url: "https://www.lesswrong.com/allPosts?sortedBy=new",
    name: "Less Wrong",
  },
  {
    url: "https://gwern.net/doc/newest/index",
    name: "Gwern",
  },
  {
    url: "https://aeon.co/_next/data/CWBEclwNd3H3XV68vOOEv/index.json",
    name: "Aeon",
  },
  {
    url: "https://www.newyorker.com/latest",
    name: "New Yorker",
  },
  {
    url: "https://www.psych.ox.ac.uk/news",
    name: "Oxford Psychology",
  },
  {
    url: "https://www.neurologylive.com/",
    name: "Neurology Live",
  },
  {
    url: "https://news.ycombinator.com/",
    name: "Hacker News",
  },
  {
    url: "https://philosophyofbrains.com",
    name: "Philosophy of Brains",
  },
  {
    url: "https://braininitiative.nih.gov/news-events/blog",
    name: "NIH Brain Initiative",
  },
  {
    url: "https://3quarksdaily.com/",
    name: "3 Quarks Daily",
  },
  {
    url: "https://www.the-scientist.com/news",
    name: "The Scientist",
  },
  {
    url: "https://stackoverflow.blog/ai",
    name: "Stack Overflow AI",
  },
  {
    url: "https://machinelearningmastery.com/blog/",
    name: "Machine Learning Mastery",
  },
  {
    url: "https://bair.berkeley.edu/blog/",
    name: "Berkeley AI Research",
  },
  {
    url: "https://www.kaggle.com/discussions?sort=hotness",
    name: "Kaggle",
  },
  {
    url: "https://substack.com/search/Bio?searching=all_posts",
    name: "Substack",
  },
  {
    url: "https://www.alignmentforum.org/allPosts",
    name: "Alignment Forum",
  },
  {
    url: "https://www.overcomingbias.com",
    name: "Overcoming Bias",
  },
  {
    url: "https://www.exponentialview.co/?utm_source=homepage_recommendations&utm_campaign=995836",
    name: "Exponential View",
  },
  {
    url: "https://kevinmd.com",
    name: "KevinMD",
  },
  {
    url: "https://www.insideprecisionmedicine.com",
    name: "Inside Precision Medicine",
  },
  {
    url: "https://www.precisionformedicine.com/blog",
    name: "Precision Medicine",
  },
  {
    url: "https://litfl.com",
    name: "Life in the Fast Lane",
  },
  {
    url: "https://outliyr.com/blog",
    name: "Outliyr",
  },
  {
    url: "https://chrismasterjohnphd.substack.com",
    name: "Chris Masterjohn PhD",
  },
  {
    url: "https://high-fat-nutrition.blogspot.com",
    name: "Petro Dobromylskyj, PhD",
  },
  {
    url: "https://lowtoxinforum.com/whats-new/posts/6008101/",
    name: "Low Toxin Forum",
  },
  {
    url: "https://tim.blog",
    name: "tim.blog",
  },
  {
    url: "https://www.palladiummag.com",
    name: "Palladium Magazine",
  },
  {
    url: "https://marginalrevolution.com",
    name: "Marginal Revolution",
  },
  {
    url: "https://www.overcomingbias.com",
    name: "Overcoming Bias",
  },
  {
    url: "https://statmodeling.stat.columbia.edu",
    name: "Statistical Modeling",
  },
  {
    url: "https://blog.cryptographyengineering.com",
    name: "Cryptography Engineering",
  },
  {
    url: "https://storopoli.io/blog/",
    name: "Jose Storopoli, PhD",
  },
  {
    url: "https://forum.mysensors.org/#google_vignette",
    name: "MySensors",
  },
  {
    url: "https://warpcast.com/~/search/recent?q=DeSci",
    name: "Warpcast",
  },
  {
    url: "https://warpcast.com/~/channel/desci",
    name: "Warpcast",
  },
  {
    url: "https://warpcast.com/~/channel/engineering",
    name: "Warpcast",
  },
  {
    url: "https://warpcast.com/~/channel/dev",
    name: "Warpcast",
  },
  {
    url: "https://www.construction-physics.com/",
    name: "Construction Physics",
  },
  {
    url: "https://warpcast.com/~/channel/rust",
    name: "Warpcast",
  },
  {
    url: "https://warpcast.com/~/channel/zk",
    name: "Warpcast",
  },
  {
    url: "https://warpcast.com/~/channel/network-states",
    name: "Warpcast",
  },
  {
    url: "https://warpcast.com/~/channel/paragraph",
    name: "Warpcast",
  },
  {
    url: "https://warpcast.com/~/channel/science",
    name: "Warpcast",
  },
  {
    url: "https://warpcast.com/~/channel/papers-please",
    name: "Warpcast",
  },
  {
    url: "https://warpcast.com/~/channel/venturecapital",
    name: "Warpcast",
  },
  {
    url: "https://warpcast.com/~/channel/ai",
    name: "Warpcast",
  },
  {
    url: "https://warpcast.com/~/channel/founders",
    name: "Warpcast",
  },
  {
    url: "https://paragraph.xyz/",
    name: "Paragraph",
  },
  {
    url: "https://mirror.xyz/",
    name: "Mirror",
  },
  {
    url: "https://paragraph.xyz/@exmachina",
    name: "Paragraph",
  },
  {
    url: "https://a16zcrypto.com/",
    name: "A16Z Crypto",
  },
  {
    url: "https://open.spotify.com/search/Decentralized%20Science/podcastAndEpisodes",
    name: "Spotify Podcasts",
  },
  {
    url: "https://www.youtube.com/results?search_query=DeSci",
    name: "YouTube",
  },
  {
    url: "https://podcasts.apple.com/us/search?term=Decentralized",
    name: "Apple Podcasts",
  },
  {
    url: "https://warpcast.com/vitalik.eth",
    name: "Warpcast",
  },
  {
    url: "https://warpcast.com/accountless.eth",
    name: "Warpcast",
  },
  {
    url: "https://warpcast.com/proxystudio.eth",
    name: "Warpcast",
  },
  {
    url: "https://warpcast.com/fbi",
    name: "Warpcast",
  },
  {
    url: "https://warpcast.com/ethereum",
    name: "Warpcast",
  },
  {
    url: "https://open.spotify.com/show/41TNnXSv5ExcQSzEGLlGhy",
    name: "Ben Greenfield",
  },
  {
    url: "https://open.spotify.com/show/0BzTvU6TsW7uvPMpZAsf3X",
    name: "Spotify Podcasts",
  },
  {
    url: "https://open.spotify.com/show/0AVTHjV1Vat2v3OKVw7QbE",
    name: "Spotify Podcasts",
  },
  {
    url: "https://open.spotify.com/search/Decentralized%20Science/podcastAndEpisodes",
    name: "Spotify Podcasts",
  },
  {
    url: "https://www.youtube.com/results?search_query=Decentralized+Science",
    name: "YouTube",
  },
  {
    url: "https://podcasts.apple.com/us/podcast/the-human-upgrade-with-dave-asprey/id451295014",
    name: "Apple Podcasts",
  },
  {
    url: "https://biohackers.media/",
    name: "biohackers.media",
  },
  {
    url: "https://forum.dangerousthings.com/c/lounge/2",
    name: "Dangerous Things Lounge",
  },
  {
    url: "https://forum.dangerousthings.com/c/projects/6",
    name: "Dangerous Things Projects",
  },
  {
    url: "https://forum.dangerousthings.com/",
    name: "Dangerous Things",
  },
  {
    url: "https://clinicaltrials.gov/search?cond=Depression&viewType=Table&sort=StudyFirstPostDate",
    name: "clinicaltrials.gov",
  },
  {
    url: "https://clinicaltrials.gov/search?cond=PTSD&viewType=Table&sort=StudyFirstPostDate",
    name: "Clinical Trials",
  },
  {
    url: "https://clinicaltrials.gov/search?cond=Anxiety&viewType=Table&sort=StudyFirstPostDate",
    name: "Clinical Trials",
  },
  {
    url: "https://clinicaltrials.gov/search?cond=Mental%20Health&viewType=Table&sort=StudyFirstPostDate",
    name: "Clinical Trials",
  },
  {
    url: "https://thebiohacker.com/forums/whats-new/latest-activity",
    name: "The Biohacker",
  },
  // Add / merge into your existing scraping sources.
// You can also just copy the objects into your existing SCRAPING_SOURCES array.
export const EXTRA_SOURCES = [
  // ---------------------------------------------------------------------------
  // ELATA / INTERNAL
  // ---------------------------------------------------------------------------
  { url: "https://news.elata.bio/", name: "Elata News – Main Feed" },
  { url: "https://www.elata.bio/", name: "Elata – Main Site" },
  { url: "https://www.elata.bio/ecosystem", name: "Elata – Ecosystem Overview" },
  { url: "https://www.elata.bio/projects", name: "Elata – Projects in Development" },
  { url: "https://www.elata.bio/elata-token", name: "Elata – ELTA Tokenomics" },
  { url: "https://zorp.elata.bio/", name: "ZORP – Onchain Research Protocol App" },
  { url: "https://www.elata.bio/ecosystem/zorp-protocol", name: "ZORP – Protocol Overview" },

  // ---------------------------------------------------------------------------
  // BCI / NEUROTECH COMPANIES, COMMUNITIES, DEV ECOSYSTEMS
  // (High signal for open BCI + neurotech landscape)
  // ---------------------------------------------------------------------------
  { url: "https://openbci.com/community/", name: "OpenBCI – Community News & Posts" },
  { url: "https://openbci.com/blogs/news", name: "OpenBCI – Blog & News" },

  { url: "https://neurosity.co/blog", name: "Neurosity – Blog" },
  { url: "https://www.neurotrackerx.com/blog", name: "NeuroTrackerX – Blog" },

  { url: "https://neurotechx.com/", name: "NeuroTechX – Main Site" },
  { url: "https://neurotechx.com/community/", name: "NeuroTechX – Community" },

  { url: "https://neurotechjp.com/jp/blog", name: "NeurotechJP – Japanese Neurotech Blog" },

  { url: "https://www.emotiv.com/", name: "EMOTIV – EEG Platform (News & Updates)" },

  { url: "https://www.gtec.at/", name: "g.tec – Neurotechnology Main Site" },
  { url: "https://www.gtec.at/news-events/", name: "g.tec – News & Events" },

  { url: "https://www.blackrockneurotech.com/insights/", name: "Blackrock Neurotech – Insights & News" },

  { url: "https://www.synchron.com/", name: "Synchron – Company Site & News" },

  { url: "https://www.paradromics.com/news/", name: "Paradromics – News" },

  { url: "https://precisionneuro.io/", name: "Precision Neuroscience – Company Site" },

  { url: "https://www.cognixion.com/", name: "Cognixion – Company Site & Updates" },

  { url: "https://kernel.co/blog", name: "Kernel – Brain Recording Blog" },

  { url: "https://www.mindmaze.com/news/", name: "MindMaze – News" },

  { url: "https://www.neuroelectrics.com/blog/", name: "Neuroelectrics – Blog" },

  { url: "https://www.neuroelectrics.com/", name: "Neuroelectrics – Main Site" },

  { url: "https://www.neuropace.com/news-and-events/", name: "NeuroPace – News & Events" },

  { url: "https://www.nevro.com/English/news/default.aspx", name: "Nevro – Neuromodulation News" },

  { url: "https://www.brainsway.com/news/", name: "BrainsWay – TMS News" },

  // Consumer neuro / EEG & wellness with decent technical spillover
  { url: "https://choosemuse.com/blog", name: "Muse – Brain-Sensing Headband Blog" },
  { url: "https://www.myndspan.com/news", name: "MYndspan – Brain Health News" },

  // ---------------------------------------------------------------------------
  // BCI / NEUROTECH MEDIA & POLICY COVERAGE (THEMATIC TAGS, NOT GENERAL NEWS)
  // ---------------------------------------------------------------------------
  { url: "https://www.wired.com/tag/brain-computer-interface/", name: "WIRED – Brain-Computer Interface Tag" },
  { url: "https://www.wired.com/tag/neuroscience/", name: "WIRED – Neuroscience Tag" },

  { url: "https://www.theguardian.com/science/neuroscience", name: "The Guardian – Neuroscience" },
  { url: "https://www.theguardian.com/world/series/neurotechnology", name: "The Guardian – Neurotechnology Coverage" },

  { url: "https://www.nature.com/subjects/brain-computer-interfaces", name: "Nature – Brain-Computer Interfaces Topic" },
  { url: "https://www.nature.com/collections/ahcajddaaf", name: "Nature – Conformable BCI/BMI Collection" },

  { url: "https://www.science.org/journal/science?topic=neuroscience", name: "Science – Neuroscience Topic" },
  { url: "https://www.science.org/topic/neuroscience", name: "Science – Neuroscience Topic Hub" },

  { url: "https://www.technologyreview.com/topic/biomedicine/neuroscience/", name: "MIT Tech Review – Neuroscience" },
  { url: "https://www.technologyreview.com/topic/computing/artificial-intelligence/brain-computer-interfaces/", name: "MIT Tech Review – BCI Coverage" },

  { url: "https://www.statnews.com/tag/brain-computer-interfaces/", name: "STAT News – Brain-Computer Interfaces" },
  { url: "https://www.statnews.com/tag/neuroscience/", name: "STAT News – Neuroscience" },

  // ---------------------------------------------------------------------------
  // ACADEMIC & RESEARCH: BCI / NEUROTECH / NEUROSCIENCE
  // ---------------------------------------------------------------------------
  { url: "https://pubmed.ncbi.nlm.nih.gov/?term=brain-computer+interface", name: "PubMed – Brain-Computer Interface Search" },
  { url: "https://pubmed.ncbi.nlm.nih.gov/?term=neurotechnology", name: "PubMed – Neurotechnology Search" },

  { url: "https://arxiv.org/search/?query=brain+computer+interface&searchtype=all&source=header", name: "arXiv – Brain-Computer Interface Search" },
  { url: "https://arxiv.org/search/?query=neurotechnology&searchtype=all&source=header", name: "arXiv – Neurotechnology Search" },

  { url: "https://iopscience.iop.org/journal/1741-2552", name: "Journal of Neural Engineering – IOPscience" },
  { url: "https://www.tandfonline.com/journals/tbci20", name: "Brain-Computer Interfaces Journal – Taylor & Francis" },

  { url: "https://www.frontiersin.org/journals/neuroscience", name: "Frontiers in Neuroscience – Journal" },
  { url: "https://www.frontiersin.org/journals/human-neuroscience", name: "Frontiers in Human Neuroscience – Journal" },
  { url: "https://www.frontiersin.org/journals/neuroinformatics", name: "Frontiers in Neuroinformatics – Journal" },

  { url: "https://www.cell.com/neuron/home", name: "Neuron – Journal Home" },
  { url: "https://www.cell.com/trends/neurosciences/home", name: "Trends in Neurosciences – Journal Home" },

  { url: "https://www.sciencedirect.com/search?qs=%22brain-computer%20interface%22", name: "ScienceDirect – BCI Search" },

  // ---------------------------------------------------------------------------
  // GLOBAL BRAIN PROJECTS, BRAIN INITIATIVES & INFRASTRUCTURES
  // ---------------------------------------------------------------------------
  { url: "https://www.braininitiative.nih.gov/", name: "US BRAIN Initiative – Main Site & News" },
  { url: "https://www.nih.gov/news-events/nih-research-matters", name: "NIH – Research Matters News" },
  { url: "https://www.ninds.nih.gov/news-events/news", name: "NIH NINDS – News & Events" },
  { url: "https://www.nimh.nih.gov/news", name: "NIH NIMH – News" },

  { url: "https://ebrains.eu/news-and-events/news-and-press-releases", name: "EBRAINS – News & Press Releases" },
  { url: "https://ebrains.eu/news-and-events", name: "EBRAINS – News & Events Hub" },

  { url: "https://www.internationalbraininitiative.org/", name: "International Brain Initiative – Site & News" },

  // China / East Asia – English-facing science / brain / neurotech news
  { url: "https://english.cas.cn/newsroom/research_news/", name: "Chinese Academy of Sciences – Research News" },
  { url: "https://english.cas.cn/newsroom/newsreleases/", name: "Chinese Academy of Sciences – News Releases" },

  { url: "https://cbs.riken.jp/en/news/", name: "RIKEN Center for Brain Science – News" },

  // Russia / Europe – research-heavy but not exclusively neuro
  { url: "https://www.hse.ru/en/news/science/", name: "HSE (Russia) – Science News" },
  { url: "https://www.skoltech.ru/en/news/", name: "Skoltech – News" },

  // ---------------------------------------------------------------------------
  // REGULATORS & PUBLIC AGENCIES (NEURO / MED DEVICES / FUNDING)
  // ---------------------------------------------------------------------------
  { url: "https://www.fda.gov/news-events/press-announcements", name: "US FDA – Press Announcements" },
  { url: "https://www.fda.gov/medical-devices/news-events-medical-devices", name: "US FDA – Medical Devices News" },

  { url: "https://www.ema.europa.eu/en/news-events", name: "EMA – News & Events" },

  { url: "https://www.nih.gov/news-events/news-releases", name: "NIH – News Releases" },
  { url: "https://www.nsf.gov/news", name: "NSF – News" },

  { url: "https://www.ukri.org/news/", name: "UKRI – News" },
  { url: "https://www.nihr.ac.uk/news", name: "NIHR – News" },

  { url: "https://wellcome.org/news", name: "Wellcome Trust – News" },
  { url: "https://www.chanzuckerberg.com/newsroom", name: "Chan Zuckerberg Initiative – Newsroom" },

  { url: "https://www.unesco.org/en/news", name: "UNESCO – News (Neurotech Ethics / Neural Data)" },

  // ---------------------------------------------------------------------------
  // CLINICAL TRIALS, PATENTS, REGULATORY PIPELINE SIGNALS
  // ---------------------------------------------------------------------------
  {
    url: "https://clinicaltrials.gov/ct2/results?cond=&term=brain-computer+interface",
    name: "ClinicalTrials.gov – Brain-Computer Interface Trials",
  },
  {
    url: "https://clinicaltrials.gov/ct2/results?cond=&term=neurotechnology",
    name: "ClinicalTrials.gov – Neurotechnology Trials",
  },

  {
    url: "https://patents.google.com/?q=%22brain-computer+interface%22",
    name: "Google Patents – Brain-Computer Interface Search",
  },
  {
    url: "https://patents.google.com/?q=EEG+neurofeedback",
    name: "Google Patents – EEG Neurofeedback Search",
  },

  {
    url: "https://patentscope.wipo.int/search/en/search.jsf?query=%22brain-computer+interface%22",
    name: "WIPO Patentscope – Brain-Computer Interface Search",
  },

  // ---------------------------------------------------------------------------
  // DESCi, CRYPTO, PUBLIC GOODS FUNDING, TOKEN ECONOMICS
  // ---------------------------------------------------------------------------
  { url: "https://vitalik.ca/", name: "Vitalik Buterin – Blog (Public Goods / Mechanism Design)" },
  { url: "https://blog.ethereum.org/", name: "Ethereum Foundation – Blog" },
  { url: "https://ethresear.ch/", name: "Ethereum Research – Forum" },

  { url: "https://www.optimism.io/blog", name: "Optimism – Retroactive Public Goods & Funding Blog" },
  { url: "https://www.gitcoin.co/blog", name: "Gitcoin – Public Goods Funding Blog" },

  { url: "https://research.paradigm.xyz/", name: "Paradigm – Crypto Research (Game Theory, Mechanism Design)" },
  { url: "https://www.radicalxchange.org/media/", name: "RadicalxChange – Media & Essays (Quadratic Funding etc.)" },

  { url: "https://vitadao.com/blog", name: "VitaDAO – Longevity / DeSci Blog" },
  { url: "https://molecule.to/blog", name: "Molecule – DeSci & Biotech Funding Blog" },

  { url: "https://www.desci.world/", name: "DeSci World – Ecosystem & Updates" },
  { url: "https://www.desci.london/", name: "DeSci London – Event & Ecosystem Hub" },

  // General econ / public finance & science funding structure
  { url: "https://www.nber.org/topics/public-economics", name: "NBER – Public Economics Topic" },
  { url: "https://www.nber.org/topics/health-economics", name: "NBER – Health Economics Topic" },

  { url: "https://voxeu.org/", name: "VoxEU – Policy / Public Economics Commentary" },

  // ---------------------------------------------------------------------------
  // GITHUB – ELATA & OPEN-SOURCE NEUROTECH / EEG STACKS
  // (Scraper just sees HTML list of commits / releases; GPT can lift dates + titles)
  // ---------------------------------------------------------------------------
  { url: "https://github.com/Elata-Biosciences", name: "GitHub – Elata Biosciences Org Overview" },
  { url: "https://github.com/Elata-Biosciences/elata-vsm-system-4/commits", name: "Elata VSM System 4 – Commits" },
  { url: "https://github.com/Elata-Biosciences/elata-eeg/commits", name: "Elata EEG – Commits" },
  { url: "https://github.com/Elata-Biosciences/zorp/commits", name: "ZORP – Commits" },

  // Add al other elata repos here
  { url: "https://github.com/Elata-Biosciences/elata-protocol/commits", name: "Elata Protocol – Commits" },


  { url: "https://github.com/OpenBCI", name: "GitHub – OpenBCI Org Overview" },
  { url: "https://github.com/OpenBCI/OpenBCI_GUI/commits", name: "OpenBCI GUI – Commits" },
  { url: "https://github.com/OpenBCI/OpenBCI_Hardware/commits", name: "OpenBCI Hardware – Commits" },

  { url: "https://github.com/brainflow-dev/brainflow/commits", name: "BrainFlow – Commits" },

  { url: "https://github.com/mne-tools/mne-python/commits", name: "MNE-Python – Commits" },
  { url: "https://github.com/mne-tools/mne-bids/commits", name: "MNE-BIDS – Commits" },

  { url: "https://github.com/NeuroTechX", name: "GitHub – NeuroTechX Org Overview" },

  { url: "https://github.com/OpenBCI/OpenBCI_Library/commits", name: "OpenBCI Library – Commits" },

  // ---------------------------------------------------------------------------
  // MISC HIGH-SIGNAL NEURO / BCI / ETHICS SOURCES
  // ---------------------------------------------------------------------------
  { url: "https://www.incf.org/news", name: "INCF – Neuroinformatics News" },
  { url: "https://www.ieee-brain.org/news/", name: "IEEE Brain – News" },

  { url: "https://royalsociety.org/topics-policy/projects/brain-waves/", name: "Royal Society – Brain Waves / Neuro Policy" },

  { url: "https://www.neuroethics.upenn.edu/news", name: "Penn Center for Neuroscience & Society – Neuroethics News" },

  { url: "https://www.thelancet.com/journals/laneur/issue/current", name: "The Lancet Neurology – Current Issue" },
  { url: "https://www.thelancet.com/journals/lanpsy/issue/current", name: "The Lancet Psychiatry – Current Issue" },

];
