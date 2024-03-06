import React, { Component } from 'react';
import withRouter from '../common/withRouter';

class PurchaseInfoForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { purchase } = this.props;
    if (!purchase) return <div />;

    return (
      <>
        {purchase.map((item) => (
          <div key={item.id} className="purchase-detail-form">
            <div>
              <p className="purchase-label">Item ID: {item.id}</p>
              <label
                className="purchase-label"
                htmlFor="item-description-input"
              >
                Description:
                <input
                  id="item-description-input"
                  type="text"
                  className="text-input purchase-txt-field"
                  value={item.description}
                  onChange={this.props.handleInputChange.bind(this)}
                />
              </label>
              <p className="purchase-label">Created: {item.created}</p>
              <p className="purchase-label">Created By: {item.created_by}</p>
              <p className="purchase-label">Modified: {item.modified}</p>
              <label className="purchase-label" htmlFor="item-notes-input">
                Notes:{' '}
              </label>
              <textarea
                id="item-notes-input"
                defaultValue={item.notes}
                onChange={this.props.handleInputChange.bind(
                  this,
                  'batch_notes_field'
                )}
              />
            </div>
          </div>
        ))}
      </>
    );
  }
}

export default withRouter(PurchaseInfoForm);
