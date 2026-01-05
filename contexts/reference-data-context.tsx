"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Define types for each reference data entity
interface Unit {
  Unit_ID: string
  Unit_Name: string
  Description: string
}

interface Department {
  Department_ID: string
  Department_Name: string
  Mapped_Unit: string
  Description: string
}

interface UserType {
  User_Type_ID: string
  User_Type_Name: string
  Description: string
}

interface SkillSet {
  Skill_Set_ID: string
  Skill_Set_Name: string
  Description: string
}

interface IPAddress {
  IP_Add_ID: string
  Name: string
  IP_Address: string
  Description: string
}

interface GeoLocation {
  GEO_LOC_ID: string
  Unit: string
  Latitude: string
  Longitude: string
}

interface TaskType {
  TT_ID: string
  Task_Type_Name: string
  Description: string
}

interface ProjectSchedule {
  PS_ID: string
  Name: string
  Description: string
}

interface ProjectType {
  PT_ID: string
  Project_Type_Name: string
  Description: string
}

interface ResourceType {
  Res_Type_ID: string
  Resource_Type_Name: string
}

interface Resource {
  Resource_ID: string
  Resource_Name: string
  Resource_Type: string
  Resource_Specification?: string
}

interface SKUCategory {
  SKU_CAT_ID: string
  SKU_Category_Name: string
  Description: string
}

interface SKUType {
  SKU_Type_ID: string
  SKU_Type_Name: string
  Description: string
}

interface LocationTag {
  LOC_TAG_ID: string
  Location_Tag: string
  Description: string
}

interface SKUUnit {
  SKU_Unit: string
}

interface SKUWeight {
  SUW_ID: string
  SKU_Single_Unit_Weight: string
}

interface Currency {
  CUR_ID: string
  Currency: string
  Default_Flag: string
}

interface QualityRating {
  QCR_ID: string
  SKU_Quality_Rating: string
}

interface AssetCategory {
  Ass_CAT_ID: string
  Asset_Category: string
}

interface AssetState {
  Ass_ST_ID: string
  Asset_Status_Name: string
  Description: string
}

interface ProductCategory {
  PRC_ID: string
  PRC_Name: string
  Description: string
}

// Define the context type
interface ReferenceDataContextType {
  units: Unit[]
  departments: Department[]
  userTypes: UserType[]
  skillSets: SkillSet[]
  ipAddresses: IPAddress[]
  geoLocations: GeoLocation[]
  taskTypes: TaskType[]
  projectSchedules: ProjectSchedule[]
  projectTypes: ProjectType[]
  resourceTypes: ResourceType[]
  resources: Resource[]
  skuCategories: SKUCategory[]
  skuTypes: SKUType[]
  locationTags: LocationTag[]
  skuUnits: SKUUnit[]
  skuWeights: SKUWeight[]
  currencies: Currency[]
  qualityRatings: QualityRating[]
  assetCategories: AssetCategory[]
  assetStates: AssetState[]
  productCategories: ProductCategory[]
  updateUnits: (units: Unit[]) => void
  updateDepartments: (departments: Department[]) => void
  updateUserTypes: (userTypes: UserType[]) => void
  updateSkillSets: (skillSets: SkillSet[]) => void
  updateIPAddresses: (ipAddresses: IPAddress[]) => void
  updateGeoLocations: (geoLocations: GeoLocation[]) => void
  updateTaskTypes: (taskTypes: TaskType[]) => void
  updateProjectSchedules: (projectSchedules: ProjectSchedule[]) => void
  updateProjectTypes: (projectTypes: ProjectType[]) => void
  updateResourceTypes: (resourceTypes: ResourceType[]) => void
  updateResources: (resources: Resource[]) => void
  updateSKUCategories: (skuCategories: SKUCategory[]) => void
  updateSKUTypes: (skuTypes: SKUType[]) => void
  updateLocationTags: (locationTags: LocationTag[]) => void
  updateSKUUnits: (skuUnits: SKUUnit[]) => void
  updateSKUWeights: (skuWeights: SKUWeight[]) => void
  updateCurrencies: (currencies: Currency[]) => void
  updateQualityRatings: (qualityRatings: QualityRating[]) => void
  updateAssetCategories: (assetCategories: AssetCategory[]) => void
  updateAssetStates: (assetStates: AssetState[]) => void
  updateProductCategories: (productCategories: ProductCategory[]) => void
}

// Initial data based on the provided tables
const initialUnits: Unit[] = [
  { Unit_ID: "U-001", Unit_Name: "All", Description: "Represents All Unit (Default Unit)" },
  { Unit_ID: "U-002", Unit_Name: "Unit 1", Description: "Unit 1 is storage unit" },
  { Unit_ID: "U-003", Unit_Name: "Production Unit 1", Description: "Production Unit" },
  { Unit_ID: "U-004", Unit_Name: "Asset Storing Facility", Description: "Asset Storing for Production Machine" },
  { Unit_ID: "U-005", Unit_Name: "Main Office", Description: "Main Office of Company" },
]

const initialDepartments: Department[] = [
  { Department_ID: "D-001", Department_Name: "All", Mapped_Unit: "All", Description: "Default Department" },
  { Department_ID: "D-002", Department_Name: "Auditing", Mapped_Unit: "All", Description: "Auditing Department" },
  { Department_ID: "D-003", Department_Name: "Quality Check", Mapped_Unit: "All", Description: "QC Department" },
  { Department_ID: "D-004", Department_Name: "IT", Mapped_Unit: "All", Description: "IT Department" },
]

const initialUserTypes: UserType[] = [
  { User_Type_ID: "UT-001", User_Type_Name: "Executives", Description: "" },
  { User_Type_ID: "UT-002", User_Type_Name: "Managers", Description: "" },
  { User_Type_ID: "UT-003", User_Type_Name: "Technicians", Description: "" },
  { User_Type_ID: "UT-004", User_Type_Name: "Worker", Description: "" },
]

const initialSkillSets: SkillSet[] = [
  { Skill_Set_ID: "SS-001", Skill_Set_Name: "Business Management", Description: "" },
  { Skill_Set_ID: "SS-002", Skill_Set_Name: "Project Management", Description: "" },
  { Skill_Set_ID: "SS-003", Skill_Set_Name: "Team Management", Description: "" },
  { Skill_Set_ID: "SS-004", Skill_Set_Name: "Auditor", Description: "" },
  { Skill_Set_ID: "SS-005", Skill_Set_Name: "Machine Operator", Description: "" },
  { Skill_Set_ID: "SS-006", Skill_Set_Name: "Quality Manager", Description: "" },
  { Skill_Set_ID: "SS-007", Skill_Set_Name: "Packaging", Description: "" },
  { Skill_Set_ID: "SS-008", Skill_Set_Name: "Electrician", Description: "" },
  { Skill_Set_ID: "SS-009", Skill_Set_Name: "Plumber", Description: "" },
  { Skill_Set_ID: "SS-010", Skill_Set_Name: "Welder", Description: "" },
  { Skill_Set_ID: "SS-011", Skill_Set_Name: "Assembly Line", Description: "" },
  { Skill_Set_ID: "SS-012", Skill_Set_Name: "HAZMAT", Description: "" },
  { Skill_Set_ID: "SS-013", Skill_Set_Name: "Machine Repair", Description: "" },
  { Skill_Set_ID: "SS-014", Skill_Set_Name: "ERT", Description: "" },
  { Skill_Set_ID: "SS-015", Skill_Set_Name: "Equipment Handling", Description: "" },
]

// Define initialIPAddresses with only the two required IP addresses
const initialIPAddresses: IPAddress[] = [
  {
    IP_Add_ID: "IP-001",
    Name: "General IP",
    IP_Address: "10.09.878.54",
    Description: "General purpose IP address for standard network operations and basic connectivity",
  },
  {
    IP_Add_ID: "IP-002",
    Name: "Production IP",
    IP_Address: "10.09.67.56",
    Description: "Production environment IP address for live system operations and critical services",
  },
]

const initialGeoLocations: GeoLocation[] = [
  { GEO_LOC_ID: "G-001", Unit: "Production Unit 1", Latitude: "29.7320° N", Longitude: "-95.3422° W" },
  { GEO_LOC_ID: "G-002", Unit: "Asset Storing Facility", Latitude: "51.5074° N", Longitude: "-0.1278° W" },
]

const initialTaskTypes: TaskType[] = [
  { TT_ID: "TT-001", Task_Type_Name: "Auditor/Complaince/QC", Description: "" },
  { TT_ID: "TT-002", Task_Type_Name: "Machine Operator", Description: "" },
  { TT_ID: "TT-003", Task_Type_Name: "Equipment Manager", Description: "" },
  { TT_ID: "TT-004", Task_Type_Name: "Warehouse Operation", Description: "" },
  { TT_ID: "TT-005", Task_Type_Name: "Maintanance Management", Description: "" },
]

const initialProjectSchedules: ProjectSchedule[] = [
  { PS_ID: "PS-001", Name: "One-Time", Description: "" },
  { PS_ID: "PS-002", Name: "Repetative", Description: "" },
]

const initialProjectTypes: ProjectType[] = [
  { PT_ID: "PT-001", Project_Type_Name: "Maintainance Work", Description: "" },
  { PT_ID: "PT-002", Project_Type_Name: "Auditing Work", Description: "" },
  { PT_ID: "PT-003", Project_Type_Name: "Production Work", Description: "" },
  { PT_ID: "PT-004", Project_Type_Name: "Internal Orders", Description: "" },
  { PT_ID: "PT-005", Project_Type_Name: "External Orders", Description: "" },
]

const initialResourceTypes: ResourceType[] = [
  { Res_Type_ID: "RT-001", Resource_Type_Name: "SKU" },
  { Res_Type_ID: "RT-002", Resource_Type_Name: "Asset" },
  { Res_Type_ID: "RT-003", Resource_Type_Name: "Finished Good(FG)" },
]

const initialResources: Resource[] = [
  { Resource_ID: "R-001", Resource_Name: "Pallets", Resource_Type: "Asset" },
  { Resource_ID: "R-002", Resource_Name: "Crates", Resource_Type: "Asset" },
  { Resource_ID: "R-003", Resource_Name: "Forklift Machine", Resource_Type: "Asset" },
  { Resource_ID: "R-004", Resource_Name: "Crane", Resource_Type: "Asset" },
  { Resource_ID: "R-005", Resource_Name: "Packaging Material", Resource_Type: "SKU" },
  { Resource_ID: "R-006", Resource_Name: "RAW Material", Resource_Type: "SKU" },
  { Resource_ID: "R-007", Resource_Name: "Laptop", Resource_Type: "Asset" },
  { Resource_ID: "R-008", Resource_Name: "Tables", Resource_Type: "Asset" },
  { Resource_ID: "R-009", Resource_Name: "Miscellaneous", Resource_Type: "SKU" },
]

const initialSKUCategories: SKUCategory[] = [
  { SKU_CAT_ID: "SC-001", SKU_Category_Name: "RAW Material", Description: "" },
  { SKU_CAT_ID: "SC-002", SKU_Category_Name: "Spare Parts", Description: "" },
  { SKU_CAT_ID: "SC-003", SKU_Category_Name: "Packaging Material", Description: "" },
  { SKU_CAT_ID: "SC-004", SKU_Category_Name: "Others", Description: "" },
]

const initialSKUTypes: SKUType[] = [
  { SKU_Type_ID: "ST-001", SKU_Type_Name: "Primary", Description: "" },
  { SKU_Type_ID: "ST-002", SKU_Type_Name: "Secondary", Description: "" },
]

const initialLocationTags: LocationTag[] = [
  {
    LOC_TAG_ID: "LT-001",
    Location_Tag: "U1-W1-Z2-R3",
    Description: "Nomanclature is Unit-Warehouse-Zone-Rack.",
  },
  { LOC_TAG_ID: "LT-002", Location_Tag: "U1-W1-Z4", Description: "" },
  { LOC_TAG_ID: "LT-003", Location_Tag: "U1-W1-Z5", Description: "" },
  { LOC_TAG_ID: "LT-004", Location_Tag: "U1-W2", Description: "" },
  { LOC_TAG_ID: "LT-005", Location_Tag: "U1-W3-CR1", Description: "Cold room 1" },
  { LOC_TAG_ID: "LT-006", Location_Tag: "Packaging Store 1", Description: "" },
  { LOC_TAG_ID: "LT-007", Location_Tag: "W4-Spare-Part-Z1", Description: "" },
]

const initialSKUUnits: SKUUnit[] = [
  { SKU_Unit: "Count" },
  { SKU_Unit: "KG" },
  { SKU_Unit: "Pounds" },
  { SKU_Unit: "Liters" },
  { SKU_Unit: "Rolls" },
  { SKU_Unit: "Sheet" },
]

const initialSKUWeights: SKUWeight[] = [
  { SUW_ID: "SUW-001", SKU_Single_Unit_Weight: "KG" },
  { SUW_ID: "SUW-002", SKU_Single_Unit_Weight: "lb" },
  { SUW_ID: "SUW-003", SKU_Single_Unit_Weight: "Grams" },
]

const initialCurrencies: Currency[] = [
  { CUR_ID: "CUR-001", Currency: "USD", Default_Flag: "Yes" },
  { CUR_ID: "CUR-002", Currency: "INR", Default_Flag: "NO" },
  { CUR_ID: "CUR-003", Currency: "EUR", Default_Flag: "NO" },
  { CUR_ID: "CUR-004", Currency: "GBP", Default_Flag: "NO" },
  { CUR_ID: "CUR-005", Currency: "", Default_Flag: "NO" },
  { CUR_ID: "CUR-006", Currency: "", Default_Flag: "NO" },
  { CUR_ID: "CUR-007", Currency: "", Default_Flag: "NO" },
]

const initialQualityRatings: QualityRating[] = [
  { QCR_ID: "QCR-001", SKU_Quality_Rating: "Not Rates" },
  { QCR_ID: "QCR-002", SKU_Quality_Rating: "A-Premium" },
  { QCR_ID: "QCR-003", SKU_Quality_Rating: "B-Standard" },
  { QCR_ID: "QCR-004", SKU_Quality_Rating: "C-Economy" },
]

const initialAssetCategories: AssetCategory[] = [
  { Ass_CAT_ID: "ASC-001", Asset_Category: "Lifting Machine" },
  { Ass_CAT_ID: "ASC-002", Asset_Category: "Transfortation Asset" },
  { Ass_CAT_ID: "ASC-003", Asset_Category: "Manifacturing Machine" },
  { Ass_CAT_ID: "ASC-004", Asset_Category: "Equipement" },
  { Ass_CAT_ID: "ASC-005", Asset_Category: "Tool" },
  { Ass_CAT_ID: "ASC-006", Asset_Category: "IT Asset" },
  { Ass_CAT_ID: "ASC-007", Asset_Category: "Office Asset" },
]

const initialAssetStates: AssetState[] = [
  {
    Ass_ST_ID: "AST-001",
    Asset_Status_Name: "Active",
    Description:
      "High-performance industrial conveyor belt system currently operational in production line A, processing 500 units per hour with 99.2% uptime efficiency.",
  },
  {
    Ass_ST_ID: "AST-002",
    Asset_Status_Name: "Under Maintenance",
    Description:
      "Hydraulic press machine temporarily offline for scheduled quarterly maintenance including seal replacement, pressure calibration, and safety system inspection.",
  },
  {
    Ass_ST_ID: "AST-003",
    Asset_Status_Name: "Decommissioned",
    Description:
      "Legacy packaging equipment retired from service due to obsolescence, replaced by automated system and awaiting disposal through certified recycling vendor.",
  },
]

const initialProductCategories: ProductCategory[] = [
  { PRC_ID: "PRC-001", PRC_Name: "Office Furniture", Description: "Desks, chairs, tables, and other office furnishings" },
  { PRC_ID: "PRC-002", PRC_Name: "Office Equipment", Description: "Electronics and equipment used in office environments" },
  { PRC_ID: "PRC-003", PRC_Name: "Storage Solutions", Description: "Shelving, cabinets, and storage products" },
  { PRC_ID: "PRC-004", PRC_Name: "Lighting", Description: "Lamps, fixtures, and lighting accessories" },
  { PRC_ID: "PRC-005", PRC_Name: "Office Supplies", Description: "Consumable office materials" },
]

// Create the context
const ReferenceDataContext = createContext<ReferenceDataContextType | undefined>(undefined)

// Create the provider component
export function ReferenceDataProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useState<Unit[]>(initialUnits)
  const [departments, setDepartments] = useState<Department[]>(initialDepartments)
  const [userTypes, setUserTypes] = useState<UserType[]>(initialUserTypes)
  const [skillSets, setSkillSets] = useState<SkillSet[]>(initialSkillSets)
  const [ipAddresses, setIPAddresses] = useState<IPAddress[]>(initialIPAddresses)
  const [geoLocations, setGeoLocations] = useState<GeoLocation[]>(initialGeoLocations)
  const [taskTypes, setTaskTypes] = useState<TaskType[]>(initialTaskTypes)
  const [projectSchedules, setProjectSchedules] = useState<ProjectSchedule[]>(initialProjectSchedules)
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>(initialProjectTypes)
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>(initialResourceTypes)
  const [resources, setResources] = useState<Resource[]>(initialResources)
  const [skuCategories, setSKUCategories] = useState<SKUCategory[]>(initialSKUCategories)
  const [skuTypes, setSKUTypes] = useState<SKUType[]>(initialSKUTypes)
  const [locationTags, setLocationTags] = useState<LocationTag[]>(initialLocationTags)
  const [skuUnits, setSKUUnits] = useState<SKUUnit[]>(initialSKUUnits)
  const [skuWeights, setSKUWeights] = useState<SKUWeight[]>(initialSKUWeights)
  const [currencies, setCurrencies] = useState<Currency[]>(initialCurrencies)
  const [qualityRatings, setQualityRatings] = useState<QualityRating[]>(initialQualityRatings)
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>(initialAssetCategories)
  const [assetStates, setAssetStates] = useState<AssetState[]>(initialAssetStates)
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(initialProductCategories)

  const updateUnits = (newUnits: Unit[]) => setUnits(newUnits)
  const updateDepartments = (newDepartments: Department[]) => setDepartments(newDepartments)
  const updateUserTypes = (newUserTypes: UserType[]) => setUserTypes(newUserTypes)
  const updateSkillSets = (newSkillSets: SkillSet[]) => setSkillSets(newSkillSets)
  const updateIPAddresses = (newIPAddresses: IPAddress[]) => setIPAddresses(newIPAddresses)
  const updateGeoLocations = (newGeoLocations: GeoLocation[]) => setGeoLocations(newGeoLocations)
  const updateTaskTypes = (newTaskTypes: TaskType[]) => setTaskTypes(newTaskTypes)
  const updateProjectSchedules = (newProjectSchedules: ProjectSchedule[]) => setProjectSchedules(newProjectSchedules)
  const updateProjectTypes = (newProjectTypes: ProjectType[]) => setProjectTypes(newProjectTypes)
  const updateResourceTypes = (newResourceTypes: ResourceType[]) => setResourceTypes(newResourceTypes)
  const updateResources = (newResources: Resource[]) => setResources(newResources)
  const updateSKUCategories = (newSKUCategories: SKUCategory[]) => setSKUCategories(newSKUCategories)
  const updateSKUTypes = (newSKUTypes: SKUType[]) => setSKUTypes(newSKUTypes)
  const updateLocationTags = (newLocationTags: LocationTag[]) => setLocationTags(newLocationTags)
  const updateSKUUnits = (newSKUUnits: SKUUnit[]) => setSKUUnits(newSKUUnits)
  const updateSKUWeights = (newSKUWeights: SKUWeight[]) => setSKUWeights(newSKUWeights)
  const updateCurrencies = (newCurrencies: Currency[]) => setCurrencies(newCurrencies)
  const updateQualityRatings = (newQualityRatings: QualityRating[]) => setQualityRatings(newQualityRatings)
  const updateAssetCategories = (newAssetCategories: AssetCategory[]) => setAssetCategories(newAssetCategories)
  const updateAssetStates = (newAssetStates: AssetState[]) => setAssetStates(newAssetStates)
  const updateProductCategories = (newProductCategories: ProductCategory[]) => setProductCategories(newProductCategories)

  return (
    <ReferenceDataContext.Provider
      value={{
        units,
        departments,
        userTypes,
        skillSets,
        ipAddresses,
        geoLocations,
        taskTypes,
        projectSchedules,
        projectTypes,
        resourceTypes,
        resources,
        skuCategories,
        skuTypes,
        locationTags,
        skuUnits,
        skuWeights,
        currencies,
        qualityRatings,
        assetCategories,
        assetStates,
        productCategories,
        updateUnits,
        updateDepartments,
        updateUserTypes,
        updateSkillSets,
        updateIPAddresses,
        updateGeoLocations,
        updateTaskTypes,
        updateProjectSchedules,
        updateProjectTypes,
        updateResourceTypes,
        updateResources,
        updateSKUCategories,
        updateSKUTypes,
        updateLocationTags,
        updateSKUUnits,
        updateSKUWeights,
        updateCurrencies,
        updateQualityRatings,
        updateAssetCategories,
        updateAssetStates,
        updateProductCategories,
      }}
    >
      {children}
    </ReferenceDataContext.Provider>
  )
}

// Create a hook to use the context
export function useReferenceData() {
  const context = useContext(ReferenceDataContext)
  if (context === undefined) {
    throw new Error("useReferenceData must be used within a ReferenceDataProvider")
  }
  return context
}
