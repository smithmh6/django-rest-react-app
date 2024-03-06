const purchaseItemFields = new Map([
  [
    'id',
    {
      display: 'ID',
    },
  ],
  [
    'modified',
    {
      display: 'Modified',
      dataType: 'date',
      editable: false,
      isVisible: false,
      required: false,
    },
  ],
  [
    'request_modified',
    {
      display: 'Modified',
      dataType: 'date',
      editable: false,
      isVisible: false,
      required: false,
    },
  ],
  [
    'username',
    {
      display: 'User',
      options: {},
      editable: false,
      required: false,
      onCreate: false,
      isVisible: false,
    },
  ],
  [
    'vendor',
    {
      display: 'Vendor',
      control: 'selectinput',
      options: {
        choices: [],
      },
      editable: true,
      required: true,
    },
  ],
  [
    'description',
    {
      display: 'Description',
      control: 'textinput',
      options: {
        placeholder: 'Description',
      },
      editable: true, // cannot edit after creation
      required: true,
    },
  ],
  [
    'product_no',
    {
      display: 'Product No.',
      control: 'textinput',
      options: {
        placeholder: 'Product No.',
      },
      editable: true,
      required: true,
    },
  ],
  [
    'package_size',
    {
      display: 'Pkg. Size',
      control: 'textinput',
      options: {
        placeholder: 'Package Size',
      },
      editable: true,
      required: true,
    },
  ],
  [
    'min_order_qty',
    {
      display: 'Min. QTY',
      control: 'numberinput',
      options: {},
      editable: true,
      required: true,
    },
  ],
  [
    'cost',
    {
      display: 'Unit Cost ($)',
      control: 'numberinput',
      options: {},
      editable: true,
      required: true,
    },
  ],
  [
    'qty',
    {
      display: 'QTY',
      control: 'numberinput',
      options: {},
      editable: true,
      required: true,
    },
  ],
  [
    'total',
    {
      display: 'Total ($)',
      dataType: 'currency',
      control: 'numberinput',
      options: {},
      editable: false,
      required: true,
      onCreate: false,
    },
  ],
  [
    'url',
    {
      display: 'URL',
      control: 'textinput', // change to url when needing <a> element
      options: {
        placeholder: 'URL',
      },
      editable: true,
      required: true,
    },
  ],
  [
    'purchase_order',
    {
      display: 'PO',
      control: 'textinput',
      options: {
        placeholder: 'PO No.',
      },
      editable: true,
      required: false,
    },
  ],
  [
    'quote',
    {
      display: 'Quote',
      control: 'textinput',
      options: {
        placeholder: 'Quote No.',
      },
      editable: true,
      required: false,
    },
  ],

  [
    'group',
    {
      display: 'Group',
      control: 'selectinput',
      options: {
        choices: [],
      },
      editable: true,
      required: false,
    },
  ],
  [
    'category',
    {
      display: 'Category',
      control: 'selectinput',
      options: {
        choices: [],
      },
      editable: true,
      required: false,
    },
  ],
  [
    'project',
    {
      display: 'Project',
      control: 'selectinput',
      options: {
        choices: [],
      },
      editable: true,
      required: false,
    },
  ],
  [
    'authorized',
    {
      display: 'Authorized',
      control: 'selectinput',
      options: {
        choices: [],
      },
      editable: false,
      required: false,
      onCreate: false,
    },
  ],
  [
    'approved',
    {
      display: 'Approved',
      control: 'selectinput',
      options: {
        choices: [],
      },
      editable: false,
      required: false,
      onCreate: false,
    },
  ],
  [
    'status',
    {
      display: 'Status',
      control: 'selectinput',
      options: {
        choices: [],
      },
      editable: false,
      required: false,
      onCreate: false,
    },
  ],
  [
    'received',
    {
      display: 'Received',
      control: 'numberinput',
      options: {
        placeholder: '0',
      },
      editable: true,
      required: false,
      onCreate: false,
      isVisible: true,
    },
  ],
  [
    'notes',
    {
      display: 'Notes',
      control: 'textarea',
      options: {
        placeholder: 'Notes',
      },
      editable: true,
      required: false,
    },
  ],
  [
    'est_delivery',
    {
      display: 'Est. Delivery',
      control: 'dateinput',
      options: {},
      editable: false,
      required: false,
      onCreate: false,
      isVisible: true,
    },
  ],
]);

export default purchaseItemFields;
