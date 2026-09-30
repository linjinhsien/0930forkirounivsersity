/**
 * Test Fixture: Mock Azure Card Data
 * 
 * Provides pre-defined card data for testing validation,
 * scoring, and game logic without requiring full card database.
 */

import type { AzureCard } from '@/types/game'

/**
 * Mock Cloud Concepts cards
 */
export const mockCloudConceptsCards: AzureCard[] = [
  {
    id: 'cc-high-availability',
    name: 'High Availability Architecture',
    domain: 'cloud-concepts',
    cost: 0,
    synergyTags: ['availability', 'reliability', 'multi-region'],
    az900ExamTip: 'HA ensures service uptime through redundancy and failover',
    description: 'Design pattern for minimizing downtime through redundant components',
    power: 80,
  },
  {
    id: 'cc-elastic-scaling',
    name: 'Elastic Scaling',
    domain: 'cloud-concepts',
    cost: 0,
    synergyTags: ['scalability', 'performance', 'auto-scaling'],
    az900ExamTip: 'Elasticity allows resources to scale automatically based on demand',
    description: 'Automatic resource adjustment based on workload patterns',
    power: 75,
  },
  {
    id: 'cc-opex-model',
    name: 'OpEx Advantage',
    domain: 'cloud-concepts',
    cost: 0,
    synergyTags: ['cost', 'finance', 'operational'],
    az900ExamTip: 'OpEx model shifts from upfront CapEx to pay-as-you-go operating expenses',
    description: 'Operational expenditure model for cloud consumption',
    power: 60,
  },
]

/**
 * Mock Azure Services cards
 */
export const mockAzureServicesCards: AzureCard[] = [
  {
    id: 'as-app-service',
    name: 'Azure App Service',
    domain: 'azure-services',
    cost: 5,
    synergyTags: ['compute', 'paas', 'web', 'scaling'],
    az900ExamTip: 'PaaS for web apps with built-in scaling and DevOps integration',
    description: 'Fully managed platform for building and hosting web applications',
    power: 70,
    conflicts: ['as-vm-windows'],
  },
  {
    id: 'as-sql-database',
    name: 'Azure SQL Database',
    domain: 'azure-services',
    cost: 6,
    synergyTags: ['database', 'paas', 'sql', 'managed'],
    az900ExamTip: 'Managed relational database with automatic updates and scaling',
    description: 'Fully managed SQL database service with built-in intelligence',
    power: 75,
    requirements: ['as-vnet'],
  },
  {
    id: 'as-blob-storage',
    name: 'Azure Blob Storage',
    domain: 'azure-services',
    cost: 3,
    synergyTags: ['storage', 'blob', 'unstructured'],
    az900ExamTip: 'Object storage for massive amounts of unstructured data',
    description: 'Scalable object storage for cloud-native workloads',
    power: 65,
  },
  {
    id: 'as-vnet',
    name: 'Azure Virtual Network',
    domain: 'azure-services',
    cost: 1,
    synergyTags: ['network', 'connectivity', 'isolation'],
    az900ExamTip: 'Private network in Azure for secure resource communication',
    description: 'Isolated network for Azure resources',
    power: 80,
  },
  {
    id: 'as-vm-windows',
    name: 'Windows Virtual Machine',
    domain: 'azure-services',
    cost: 8,
    synergyTags: ['compute', 'iaas', 'windows', 'vm'],
    az900ExamTip: 'IaaS compute with full control over Windows OS',
    description: 'Windows-based virtual machine with full OS control',
    power: 70,
    requirements: ['as-vnet'],
  },
  {
    id: 'as-functions',
    name: 'Azure Functions',
    domain: 'azure-services',
    cost: 2,
    synergyTags: ['compute', 'serverless', 'event-driven'],
    az900ExamTip: 'Serverless compute for event-driven workloads',
    description: 'Event-driven serverless compute service',
    power: 75,
  },
]

/**
 * Mock Management & Governance cards
 */
export const mockGovernanceCards: AzureCard[] = [
  {
    id: 'mg-azure-policy',
    name: 'Azure Policy',
    domain: 'management-governance',
    cost: 0,
    synergyTags: ['governance', 'compliance', 'enforcement'],
    az900ExamTip: 'Enforce organizational standards and compliance at scale',
    description: 'Service for creating, assigning, and managing policies',
    power: 85,
  },
  {
    id: 'mg-rbac',
    name: 'Role-Based Access Control',
    domain: 'management-governance',
    cost: 0,
    synergyTags: ['security', 'identity', 'access-control', 'rbac'],
    az900ExamTip: 'Manage access through role assignments with least privilege',
    description: 'Fine-grained access management for Azure resources',
    power: 90,
  },
  {
    id: 'mg-cost-management',
    name: 'Azure Cost Management',
    domain: 'management-governance',
    cost: 0,
    synergyTags: ['cost', 'monitoring', 'optimization'],
    az900ExamTip: 'Monitor and optimize Azure spending',
    description: 'Tools for cost visibility and optimization',
    power: 70,
  },
  {
    id: 'mg-monitor',
    name: 'Azure Monitor',
    domain: 'management-governance',
    cost: 2,
    synergyTags: ['monitoring', 'observability', 'logging'],
    az900ExamTip: 'Comprehensive monitoring for Azure resources',
    description: 'Full-stack monitoring and diagnostics',
    power: 80,
  },
]

/**
 * All mock cards combined
 */
export const allMockCards: AzureCard[] = [
  ...mockCloudConceptsCards,
  ...mockAzureServicesCards,
  ...mockGovernanceCards,
]

/**
 * Get card by ID from mock data
 */
export function getMockCardById(id: string): AzureCard | undefined {
  return allMockCards.find(card => card.id === id)
}

/**
 * Get cards by domain
 */
export function getMockCardsByDomain(
  domain: 'cloud-concepts' | 'azure-services' | 'management-governance'
): AzureCard[] {
  return allMockCards.filter(card => card.domain === domain)
}

/**
 * Get cards with specific synergy tag
 */
export function getMockCardsByTag(tag: string): AzureCard[] {
  return allMockCards.filter(card => card.synergyTags.includes(tag))
}

/**
 * Create a custom mock card for edge case testing
 */
export function createMockCard(overrides: Partial<AzureCard>): AzureCard {
  return {
    id: 'mock-card',
    name: 'Mock Card',
    domain: 'azure-services',
    cost: 5,
    synergyTags: ['test'],
    az900ExamTip: 'Mock card for testing',
    description: 'A mock card for unit tests',
    power: 50,
    ...overrides,
  }
}
