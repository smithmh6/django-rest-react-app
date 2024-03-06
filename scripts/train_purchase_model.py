"""
Build, train, and save the purchasing LSTM model.
"""

import kernel_init
from django.db.models import Sum, Q
import numpy as np
import os
import tempfile
from time import perf_counter
from tqdm import tqdm
from purchasing.models import *
from purchasing.serializers import *

WINDOW = 30  # look-back
HORIZON = 1  # look-forward

VERSION = 1
MODEL_NAME = f"purchase_lstm_forecast_model"
EXPORT_PATH_BASE = os.path.join(r'C:/Users/hsmith/models', MODEL_NAME)
EXPORT_PATH = os.path.join(EXPORT_PATH_BASE, str(VERSION))

def create_sequences(data, window, horizon):
    """
    Generate data sequences.
    """
    x, y = [], []

    for i in range(len(data)):
        x_end = i + window

        if x_end > len(data) - 1:
            break

        x.append(data[i:x_end])
        y.append(data[x_end])

    x = np.expand_dims(x, axis=1)

    print(f"x shape= {np.shape(x)}  y shape= {np.shape(y)}")
    return x, np.asarray(y)

def main():
    """
    Main script.
    """


    t0 = perf_counter()

    print("Importing tensorflow..")
    import tensorflow as tf
    from tensorflow.python.client import device_lib
    t1 = perf_counter()
    print(f"Completed in {round(t1 - t0, 4)} s")

    tf.random.set_seed(1)

    print(f"Building model [{MODEL_NAME}]")
    print(f"Devices: {[x.name for x in device_lib.list_local_devices()]}")
    print([gpu for gpu in tf.config.experimental.list_physical_devices('GPU')])

    # query requested dates and total daily costs
    qs = Purchase.objects.filter(~Q(requested=None)).values('requested').order_by('requested').annotate(daily_total=Sum('total_cost'))

    # extract daily total costs values
    dtc = [float(row['daily_total']) for row in qs]
    dates = [d['requested'] for d in qs]

    # sum each value n with sum(n-1) values
    dt = []
    running_total = 0
    for i in range(len(dtc)):
        running_total += dtc[i]
        dt.append(running_total)


    # normalize between 0 --> 1
    #dt_norm = (dt - np.min(dt)) / (np.max(dt) - np.min(dt))

    # split into training/validation datasets
    split = int(len(dt) * 0.8)

    dt_train = dt[:split]
    dt_val = dt[split:-1]

    print(f"Training samples: {len(dt_train)}")
    print(f"Validation samples: {len(dt_val)}")

    x_train, y_train = create_sequences(dt_train, WINDOW, HORIZON)
    x_val, y_val = create_sequences(dt_val, WINDOW, HORIZON)

    with tempfile.TemporaryDirectory() as tempdir:
        checkpoint_path = os.path.join(tempdir, 'purchase_lstm_forecast_model.h5')
        print(f"Setting checkpoint path --> {checkpoint_path}")
        # add checkpoint callback
        checkpoint = tf.keras.callbacks.ModelCheckpoint(
            checkpoint_path,
            verbose=0,
            save_best=True,
            save_weights_only=False,
            save_best_only=True,
            mode='min'
        )

        # construct the LSTM model
        model = tf.keras.models.Sequential([
            tf.keras.layers.LSTM(128, input_shape=(1, WINDOW), activation='relu'),
            #tf.keras.layers.LSTM(128, activation='relu'),
            #tf.keras.layers.Dense(64, activation='relu'),
            #tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(HORIZON)
        ])

        # compile model
        model.compile(loss='mae', optimizer='adam', metrics=['mae', 'mse'])

        model.summary()

        _history = model.fit(x_train,
                             y_train,
                             epochs=500,
                             batch_size=32,
                             validation_data=(x_val, y_val),
                             callbacks=[checkpoint],
                             verbose=2)

        # load the best trained model checkpoint
        trained_model = tf.keras.models.load_model(checkpoint_path)

        # test the performance of the model
        print("Evaluating model performance...")
        predictions = []

        # predict on training data
        for val in tqdm(x_train):
            yhat = trained_model.predict(np.expand_dims(val, axis=0), verbose=0)
            predictions.append(yhat)

        # predict on validation data
        for val in tqdm(x_val):
            yhat = trained_model.predict(np.expand_dims(val, axis=0), verbose=0)
            predictions.append(yhat)

        predictions = [p[0][0] for p in predictions]

        # calculate RMSE
        actual = np.asarray(np.concatenate((y_train, y_val)))
        predicted = np.asarray(predictions)

        MSE = np.mean((predicted - actual)**2)
        RMSE = np.sqrt(MSE)
        print('mse -->', MSE)
        print('rmse -->', RMSE)

        # export the trained model to EXPORT_PATH
        print(f"Saving model to --> {EXPORT_PATH}")
        tf.keras.models.save_model(
            trained_model,
            EXPORT_PATH,
            overwrite=True,
            include_optimizer=True,
            save_format=None,
            signatures=None,
            options=None
        )

        t2 = perf_counter()
        print(f"Elapsed time: {round((t2 - t0)/60, 4)} minutes")

if __name__=="__main__":
    main()
