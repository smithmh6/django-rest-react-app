const purchaseRequestFields = new Map([
  [
    'id',
    {
      display: 'Request ID',
    },
  ],
  [
    'created',
    {
      display: 'Created',
      dataType: 'datetime', // can be date or datetime
    },
  ],
  [
    'modified',
    {
      display: 'Modified',
      dataType: 'datetime',
    },
  ],
  [
    'user',
    {
      display: 'User',
    },
  ],
  [
    'item_count',
    {
      display: 'Items',
    },
  ],
  [
    'total_cost',
    {
      display: 'Requested ($)',
      dataType: 'currency',
    },
  ],
  [
    'total_approved',
    {
      display: 'Approved ($)',
      dataType: 'currency',
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
    'notes',
    {
      display: 'Notes',
      control: 'textarea',
      options: {
        placeholder: 'Notes',
      },
    },
  ],
]);

export default purchaseRequestFields;
