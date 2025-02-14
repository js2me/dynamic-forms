import React from 'react';

import _ from 'lodash';
import {useFormState} from 'react-final-form';

import {DynamicFieldStore, FieldObjectValue, FieldValue, ValidateError} from '../types';
import {transformArrIn} from '../utils';

export const useStore = (name: string) => {
    const formState = useFormState();
    const firstRenderRef = React.useRef(true);
    const [store, setStore] = React.useState<DynamicFieldStore>(() => {
        const values: FieldObjectValue = transformArrIn({
            [name]: _.get(formState.values, name),
        });

        const initialValue = transformArrIn({
            [name]: _.get(formState.initialValues, name),
        });

        return {
            name,
            initialValue: _.cloneDeep(initialValue),
            values: _.cloneDeep(values),
            errors: {},
        };
    });

    const submitFailed = formState.submitFailed;

    const tools = React.useMemo(
        () => ({
            initialValue: store.initialValue,
            onChange: (name: string, value: FieldValue, errors?: Record<string, ValidateError>) =>
                setStore((store) => ({
                    ...store,
                    values: _.set({...store.values}, name, _.clone(value)),
                    errors: errors || {},
                })),
            onUnmount: (name: string) =>
                setStore((store) => ({
                    ...store,
                    values: _.omit(store.values, name),
                    errors: _.omit(
                        store.errors,
                        Object.keys(store.errors).filter((key) => key.startsWith(name)),
                    ),
                })),
            submitFailed,
        }),
        [store.initialValue, setStore, submitFailed],
    );

    React.useEffect(() => {
        if (!firstRenderRef.current) {
            const values: FieldObjectValue = transformArrIn({
                [name]: _.get(formState.values, name),
            });

            const initialValue = transformArrIn({
                [name]: _.get(formState.initialValues, name),
            });

            setStore({
                name: name,
                initialValue: _.cloneDeep(initialValue),
                values: _.cloneDeep(values),
                errors: {},
            });
        }
    }, [name]);

    React.useEffect(() => {
        firstRenderRef.current = false;
    }, []);

    return {tools, store};
};
