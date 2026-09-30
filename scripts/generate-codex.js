import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const cardsDir = join(projectRoot, 'src/data/cards')
const codexDir = join(projectRoot, 'src/data/codex')

if (!existsSync(codexDir)) {
  mkdirSync(codexDir, { recursive: true })
}

const cardFiles = ['cloud-concepts.json', 'azure-services.json', 'management-governance.json']
const allCards = []

for (const file of cardFiles) {
  const content = JSON.parse(readFileSync(join(cardsDir, file), 'utf-8'))
  allCards.push(...content.cards)
}

const codexMap = {
  // Domain 1: Cloud Concepts
  'cc-high-availability': {
    examDefinition: 'High Availability (HA) ensures systems remain accessible and operational with minimal downtime, typically using redundancy, clustering, and automated failover across fault domains.',
    useCases: ['Mission-critical applications requiring 99.99% uptime SLAs', 'Active-active multi-region web apps', 'Failover clusters for enterprise databases'],
    bestPractices: ['Deploy workloads across Azure Availability Zones', 'Use health probes in load balancers to detect unhealthy nodes', 'Pair regional deployments for geographic redundancy'],
    relatedServices: ['as-vmss', 'as-load-balancer', 'as-app-gateway'],
    resources: [
      { title: 'AZ-900: High Availability Fundamentals', url: 'https://learn.microsoft.com/training/modules/describe-cloud-compute/', type: 'microsoft-learn' },
      { title: 'Reliability in Azure Architecture', url: 'https://learn.microsoft.com/azure/well-architected/reliability/', type: 'documentation' }
    ]
  },
  'cc-elastic-scaling': {
    examDefinition: 'Elasticity is the ability of cloud computing to dynamically allocate and deallocate computing resources in real time to match fluctuating workloads.',
    useCases: ['Handling sudden traffic surges during flash sales', 'Scaling down dev/test infrastructure outside business hours', 'Batch queue processing based on queue depth'],
    bestPractices: ['Establish autoscale rules with cooldown periods to prevent thrashing', 'Design stateless applications for seamless horizontal scaling', 'Combine predictive and metric-based scaling rules'],
    relatedServices: ['as-app-service', 'as-vmss', 'as-functions'],
    resources: [
      { title: 'AZ-900: Cloud Scalability and Elasticity', url: 'https://learn.microsoft.com/training/modules/describe-cloud-compute/', type: 'microsoft-learn' }
    ]
  },
  'cc-opex-model': {
    examDefinition: 'Operational Expenditure (OpEx) is a cloud consumption model where customers pay for services and computing as they are used without upfront infrastructure investments.',
    useCases: ['Startups minimizing initial burn rate', 'Budget agility allowing cost adjustments monthly', 'Tax advantages deducting cloud costs in the year incurred'],
    bestPractices: ['Leverage Azure Cost Management to track spending against forecasts', 'Rightsize resources continuously using Azure Advisor', 'Tag resources by department and cost center for chargebacks'],
    relatedServices: ['mg-cost-management', 'mg-budgets', 'mg-pricing-calculator'],
    resources: [
      { title: 'AZ-900: Cloud Financial Benefits', url: 'https://learn.microsoft.com/training/modules/describe-cloud-compute/', type: 'microsoft-learn' }
    ]
  },
  'cc-capex-model': {
    examDefinition: 'Capital Expenditure (CapEx) involves spending money on physical hardware upfront and deducting that expense over its lifecycle, compared against cloud OpEx models.',
    useCases: ['Comparing on-premises total cost of ownership against cloud migration', 'Reserved instances amortized over 1-3 years', 'Procuring dedicated physical datacenters'],
    bestPractices: ['Use the Azure TCO Calculator to quantify CapEx to OpEx transitions', 'Factor in cooling, power, datacenter real estate, and IT labor into comparisons', 'Evaluate 1-year and 3-year Azure Reservations for fixed workloads'],
    relatedServices: ['mg-tco-calculator', 'mg-pricing-calculator', 'mg-cost-management'],
    resources: [
      { title: 'Compare CapEx vs. OpEx in Cloud', url: 'https://learn.microsoft.com/azure/cloud-adoption-framework/strategy/financial-model', type: 'documentation' }
    ]
  },
  'cc-scalability-vertical': {
    examDefinition: 'Vertical scaling (Scale Up) increases or decreases the capacity of an existing resource, such as upgrading a virtual machine from 4 vCPUs to 16 vCPUs.',
    useCases: ['Upgrading database instances with heavier single-thread query loads', 'Increasing RAM for memory-intensive caching systems', 'Temporary compute boost for quarterly financial calculations'],
    bestPractices: ['Account for necessary restarts when resizing VM sizes', 'Prefer horizontal scaling for stateless frontends to avoid upper hardware ceilings', 'Automate resizing during maintenance windows'],
    relatedServices: ['as-vm-windows', 'as-vm-linux', 'as-sql-database'],
    resources: [
      { title: 'Scale up and scale out in Azure', url: 'https://learn.microsoft.com/azure/architecture/guide/design-principles/scale-out', type: 'documentation' }
    ]
  },
  'cc-scalability-horizontal': {
    examDefinition: 'Horizontal scaling (Scale Out) adds or removes identical computing resources, such as adding more VM instances behind an Azure Load Balancer.',
    useCases: ['Scaling web farm capacity to handle millions of simultaneous HTTP requests', 'Processing distributed task queues across multiple worker nodes', 'Microservices scaling independently based on individual service demand'],
    bestPractices: ['Decouple application state using external databases or Redis cache', 'Place instances across multiple Availability Zones', 'Configure health probes to exclude unready instances from receiving traffic'],
    relatedServices: ['as-vmss', 'as-app-service', 'as-load-balancer'],
    resources: [
      { title: 'Design for Scaling Out', url: 'https://learn.microsoft.com/azure/architecture/guide/design-principles/scale-out', type: 'documentation' }
    ]
  },
  'cc-agility': {
    examDefinition: 'Cloud Agility is the ability to provision, develop, test, and launch technological solutions rapidly, significantly reducing time-to-market.',
    useCases: ['Spinning up complete sandbox environments in minutes via ARM/Bicep', 'Automated CI/CD deployments into staging deployment slots', 'Rapid prototyping and MVP validation without procurement delays'],
    bestPractices: ['Adopt Infrastructure as Code (IaC) using Bicep or Terraform', 'Use deployment slots in App Service for zero-downtime testing', 'Standardize governance templates using Azure Blueprints'],
    relatedServices: ['as-app-service', 'mg-blueprints', 'mg-resource-groups'],
    resources: [
      { title: 'AZ-900: Benefits of Cloud Agility', url: 'https://learn.microsoft.com/training/modules/describe-cloud-compute/', type: 'microsoft-learn' }
    ]
  },
  'cc-disaster-recovery': {
    examDefinition: 'Disaster Recovery (DR) is the process and architecture designed to protect an organization from the effects of catastrophic events and restore operations within target RTO and RPO.',
    useCases: ['Regional outage survivability via paired Azure regions', 'Automated geo-replicated database failover during environmental disasters', 'Restoring cold backup data to secondary regions'],
    bestPractices: ['Deploy cross-region architectures into Azure paired regions to benefit from phased rollouts', 'Test failover scenarios regularly using Azure Site Recovery drills', 'Define measurable Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO)'],
    relatedServices: ['as-cosmos-db', 'as-sql-database', 'as-blob-storage'],
    resources: [
      { title: 'Disaster Recovery in Azure', url: 'https://learn.microsoft.com/azure/reliability/disaster-recovery-overview', type: 'documentation' }
    ]
  },
  'cc-fault-tolerance': {
    examDefinition: 'Fault Tolerance is the ability of an architecture to remain completely uninterrupted in the event of hardware or subsystem failure through built-in active redundancy.',
    useCases: ['Critical financial payment gateways requiring zero transaction interruption', 'Medical telemetry ingestion with zero packet loss', 'Telecommunication routing networks'],
    bestPractices: ['Ensure no single point of failure (SPOF) exists in the data path', 'Use active-active load balancing across multiple fault domains', 'Implement managed services with built-in redundancy guarantees'],
    relatedServices: ['as-load-balancer', 'as-vmss', 'as-app-gateway'],
    resources: [
      { title: 'Fault Tolerance Architecture Principles', url: 'https://learn.microsoft.com/azure/well-architected/reliability/redundancy', type: 'documentation' }
    ]
  },
  'cc-iaas': {
    examDefinition: 'Infrastructure as a Service (IaaS) provides raw virtualized computing resources (VMs, storage, network) where the customer manages the OS, middleware, and applications.',
    useCases: ['Migrating legacy on-premise software requiring specific OS kernels', 'Hosting customized database engines or commercial off-the-shelf software', 'Full administrative control over network configuration and OS hardening'],
    bestPractices: ['Apply security patches to OS regularly using Azure Update Manager', 'Hardening VM images using Center for Internet Security (CIS) benchmarks', 'Place VMs inside private subnets behind Network Security Groups'],
    relatedServices: ['as-vm-windows', 'as-vm-linux', 'as-vnet', 'as-disk-storage'],
    resources: [
      { title: 'AZ-900: IaaS Service Model', url: 'https://learn.microsoft.com/training/modules/describe-cloud-service-types/', type: 'microsoft-learn' }
    ]
  },
  'cc-paas': {
    examDefinition: 'Platform as a Service (PaaS) provides a managed environment for building, testing, and deploying software where the cloud provider manages servers, OS, and runtimes.',
    useCases: ['Modern web application hosting with built-in auto-scaling', 'API backends connecting to managed relational databases', 'Microservices using managed container orchestrators'],
    bestPractices: ['Focus engineering on application logic rather than OS maintenance', 'Use managed identities to connect securely to backing services without credentials', 'Implement deployment slots for safe blue-green production releases'],
    relatedServices: ['as-app-service', 'as-sql-database', 'as-aks'],
    resources: [
      { title: 'AZ-900: PaaS Service Model', url: 'https://learn.microsoft.com/training/modules/describe-cloud-service-types/', type: 'microsoft-learn' }
    ]
  },
  'cc-saas': {
    examDefinition: 'Software as a Service (SaaS) delivers complete applications over the Internet on a subscription basis, fully hosted and managed by the vendor (e.g. Microsoft 365).',
    useCases: ['Enterprise email and collaboration (Microsoft 365, Teams)', 'Customer Relationship Management (Dynamics 365)', 'Cloud-based ticketing and ERP solutions'],
    bestPractices: ['Enforce Multi-Factor Authentication (MFA) and Conditional Access on all SaaS logins', 'Audit SaaS data access through Microsoft Entra ID integration', 'Implement data loss prevention (DLP) policies on sensitive documents'],
    relatedServices: ['mg-entra-id', 'mg-rbac', 'mg-defender'],
    resources: [
      { title: 'AZ-900: SaaS Service Model', url: 'https://learn.microsoft.com/training/modules/describe-cloud-service-types/', type: 'microsoft-learn' }
    ]
  },
  'cc-public-cloud': {
    examDefinition: 'A Public Cloud is owned and operated by a third-party cloud service provider delivering computing resources like servers and storage over the Internet to multiple tenants.',
    useCases: ['Consumer web and mobile applications with global reach', 'Rapid innovation testing without physical hardware constraints', 'Scalable analytics on elastic infrastructure'],
    bestPractices: ['Implement defense-in-depth security using Entra ID, NSGs, and firewalls', 'Establish cost governance and alerts to prevent bill shock', 'Use resource locks to protect production resource groups'],
    relatedServices: ['as-app-service', 'mg-azure-policy', 'mg-budgets'],
    resources: [
      { title: 'AZ-900: Cloud Deployment Models', url: 'https://learn.microsoft.com/training/modules/describe-cloud-compute/', type: 'microsoft-learn' }
    ]
  },
  'cc-private-cloud': {
    examDefinition: 'A Private Cloud consists of computing resources used exclusively by one business or organization, physically located at the company on-site datacenter or hosted by a third-party.',
    useCases: ['High-security defense or classified government workloads', 'Strict national data sovereignty requiring air-gapped hardware', 'Legacy workloads with non-virtualizable specialized mainframes'],
    bestPractices: ['Evaluate Azure Stack Hub to run Azure-consistent cloud services on-premises', 'Connect private environments to Azure via ExpressRoute for hybrid bursting', 'Maintain dedicated physical security and hardware lifecycle governance'],
    relatedServices: ['as-expressroute', 'as-vpn-gateway', 'cc-hybrid-cloud'],
    resources: [
      { title: 'What is Private Cloud?', url: 'https://azure.microsoft.com/overview/what-is-a-private-cloud/', type: 'documentation' }
    ]
  },
  'cc-hybrid-cloud': {
    examDefinition: 'A Hybrid Cloud connects on-premises infrastructure or private clouds with public clouds, allowing data and apps to be shared between them securely.',
    useCases: ['Gradual datacenter migration without downtime', 'Keeping sensitive customer records on-premises while running frontends in Azure', 'Cloud bursting during peak holiday seasonal retail volumes'],
    bestPractices: ['Use ExpressRoute for reliable, low-latency private connectivity', 'Deploy Azure Arc to manage on-premises Kubernetes and servers from Azure portal', 'Ensure consistent RBAC and identity policies across both domains via Entra ID'],
    relatedServices: ['as-expressroute', 'as-vpn-gateway', 'mg-entra-id'],
    resources: [
      { title: 'AZ-900: Hybrid Cloud Architecture', url: 'https://learn.microsoft.com/training/modules/describe-cloud-compute/', type: 'microsoft-learn' }
    ]
  },
  'cc-shared-responsibility': {
    examDefinition: 'The Shared Responsibility Model divides security and operational tasks between the cloud provider and the customer based on whether IaaS, PaaS, or SaaS is chosen.',
    useCases: ['Auditing regulatory compliance certifications', 'Defining IT team responsibilities versus Microsoft responsibilities', 'Establishing security baseline checklists for cloud migration'],
    bestPractices: ['Remember that data classification and identity are ALWAYS customer responsibilities', 'Understand that physical datacenter security is ALWAYS Microsoft responsibility', 'Verify patching responsibilities for guest OS in IaaS versus PaaS'],
    relatedServices: ['mg-rbac', 'mg-azure-policy', 'mg-defender'],
    resources: [
      { title: 'Shared Responsibility in the Cloud', url: 'https://learn.microsoft.com/azure/security/fundamentals/shared-responsibility', type: 'documentation' }
    ]
  },
  'cc-consumption-model': {
    examDefinition: 'A Consumption Model charges customers only for the specific computing resources, bandwidth, or function executions actually consumed, with zero cost when idle.',
    useCases: ['Serverless microservices with erratic event bursts', 'Nightly batch transformations executing for only 15 minutes', 'Proof-of-concept prototypes testing product-market fit'],
    bestPractices: ['Use Azure Functions with consumption plan for event-driven workloads', 'Monitor execution durations to ensure functions complete efficiently', 'Combine with Azure Cost Management alerts to avoid unintended infinite loops'],
    relatedServices: ['as-functions', 'as-aci', 'mg-budgets'],
    resources: [
      { title: 'AZ-900: Cloud Economics and Billing', url: 'https://learn.microsoft.com/training/modules/describe-cost-management-azure/', type: 'microsoft-learn' }
    ]
  },
  'cc-economies-of-scale': {
    examDefinition: 'Economies of Scale refers to the cost advantages that enterprises obtain due to their scale of operation, allowing hyperscalers like Microsoft to offer lower prices.',
    useCases: ['Accessing enterprise-grade hardware at pennies per hour', 'Global fiber optic backbone connectivity without capital investment', 'Continuous price reductions over cloud hardware generations'],
    bestPractices: ['Evaluate pricing tiers periodically as newer hardware generations are released', 'Take advantage of shared multi-tenant service plans where appropriate', 'Use reserved instances to capture even deeper long-term volume discounts'],
    relatedServices: ['mg-cost-management', 'mg-pricing-calculator', 'mg-tco-calculator'],
    resources: [
      { title: 'AZ-900: Cloud Economics', url: 'https://learn.microsoft.com/training/modules/describe-cloud-compute/', type: 'microsoft-learn' }
    ]
  }
}

// Write all entries
let createdCount = 0
for (const card of allCards) {
  const customData = codexMap[card.id] || {
    examDefinition: `${card.name} is a key Azure service within the ${card.domain} domain. ${card.az900ExamTip}`,
    useCases: [
      `Deploying enterprise workloads requiring ${card.synergyTags[0] || 'cloud capabilities'}`,
      `Optimizing architecture for ${card.domain}`,
      `Ensuring AZ-900 best practice implementation`
    ],
    bestPractices: [
      `Follow the Microsoft Well-Architected Framework recommendations`,
      `Enforce least privilege access using RBAC`,
      `Monitor health and telemetry through Azure Monitor`
    ],
    relatedServices: card.requirements || ['mg-monitor', 'mg-azure-policy'],
    resources: [
      {
        title: `Azure Documentation: ${card.name}`,
        url: `https://learn.microsoft.com/azure/`,
        type: 'documentation'
      },
      {
        title: `Microsoft Learn: AZ-900 Fundamentals`,
        url: `https://learn.microsoft.com/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/`,
        type: 'microsoft-learn'
      }
    ]
  }

  const entry = {
    cardId: card.id,
    examDefinition: customData.examDefinition,
    useCases: customData.useCases,
    bestPractices: customData.bestPractices,
    relatedServices: customData.relatedServices,
    resources: customData.resources
  }

  writeFileSync(join(codexDir, `${card.id}.json`), JSON.stringify(entry, null, 2), 'utf-8')
  createdCount++
}

console.log(`✅ Successfully generated ${createdCount} Codex entry JSON files in src/data/codex/!`)
