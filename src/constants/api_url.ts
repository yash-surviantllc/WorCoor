export const api_url = {
  authServices: {
    login: 'authservice/user/guest/login',
    logout: 'authservice/user/guest/logout',
    refreshToken: 'authservice/user/accessToken',
    users: {
      technicianList: 'authservice/user/technicianList',
      list: 'authservice/user/list',
      add: 'authservice/user',
      update: 'authservice/user',
      delete: 'authservice/user', // :userId
    },
    roles: {
      list: 'authservice/role/list'
    }
  },
  worCoorService: {
    referenceDataTable: {
      list: "worcoorservice/reference/table/list",
      addTableEntry: "worcoorservice/reference/table/entry",
      listTableEntry: "worcoorservice/reference/table/entry", // :tableId
      deleteTableEntry: "worcoorservice/reference/table/entry", // :tableId & :entryId
    },
    asset: {
      assetlist: "worcoorservice/asset/list",
      addAsset: "worcoorservice/asset",
      updateAsset: "worcoorservice/asset",
      deleteAsset: "worcoorservice/asset", // :assetId
    },
    inventory: {
      list: "worcoorservice/inventory/list",
      sku: {
        skuList: "worcoorservice/sku/list",
        addSku: "worcoorservice/sku",
        updateSku: "worcoorservice/sku",
        deleteSku: "worcoorservice/sku", // :skuId
        blockQty: "worcoorservice/sku/block",
        unblockQty: "worcoorservice/sku/unblock",
      },
      po: {
        poList: "worcoorservice/po/list",
        addPo: "worcoorservice/po",
        updatePo: "worcoorservice/po",
        deletePo: "worcoorservice/po", // :poId
      },
      so: {
        soList: "worcoorservice/so/list",
        addSo: "worcoorservice/so",
        updateSo: "worcoorservice/so",
        deleteSo: "worcoorservice/so", // :soId
        dispatchSo: "worcoorservice/so/dispatch",
        approveForPicklist: "worcoorservice/so/picklist/grant/" // :soId
      },
      procurement: {
        procurementList: "worcoorservice/inventory/procurement/list",
      },
      soPickList: {
        getSuggestPickList: "worcoorservice/pickList/suggest", // :soId
        generatePickList: "worcoorservice/pickList/generate",
        getPickList: "worcoorservice/pickList", // :soId
      }
    },
    task: {
      repository: {
        list: "worcoorservice/task/list",
        add: "worcoorservice/task",
        update: "worcoorservice/task",
        delete: "worcoorservice/task", // :taskId
      },
      assignTask: {
        technicians: "worcoorservice/task/technicians",
        taskNameList: "worcoorservice/task/name/list",
        listProject: 'worcoorservice/project/list',
        addProject: 'worcoorservice/project',
        editProject: 'worcoorservice/project',
        deleteProject: 'worcoorservice/project'
      },
      taskTracking: {
        getProjectNames: "worcoorservice/project/name",
        list: "worcoorservice/task/tracking/list"
      },
      taskAlert: {
        list: "worcoorservice/task/tracking/list",
        assignTask: "worcoorservice/task/concern/assign"
      }
    }
  },
  mediaService: {
    dpvu: "mediaservices/api/dpvu", // Single Document or Photo or Video Upload
    dpvmu: "mediaservices/api/dpvmu", // Multi Documents or Photos or Videox Upload
    gdpvu: "mediaservices/api/guest/dpvu", // Single Document or Photo or Video Upload (Guest API)
    gdpvmu: "mediaservices/api/guest/dpvmu", // Multi Document or Photo or Video Upload (Guest API)
  }
};