import {
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator
} from 'class-validator';
import { transformTimestampToDate } from 'src/core/utils/dateHelper.util';

export function IsMultiDay(properties: string[], validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: properties.map(property => property),
            validator: IsIsMultiDayConstraint
        });
    };
}

@ValidatorConstraint({ name: 'IsMultiDay' })
export class IsIsMultiDayConstraint implements ValidatorConstraintInterface {
    validate(multiDayValue: boolean, args: ValidationArguments) {
        const obj = { endDate: 0 || null, startDate: 0 };
        let relatedValue: any;
        args.constraints.forEach(element => {
            relatedValue = (args.object as any)[element];
            obj[element] = relatedValue;
        });

        if (multiDayValue && obj.endDate) {
            if (typeof obj.endDate !== 'number') return false;
            return transformTimestampToDate(obj.startDate) <= transformTimestampToDate(obj.endDate);
        }
        if (!multiDayValue && obj.endDate) return false;
        if (!multiDayValue && !obj.endDate) return true;
    }
    defaultMessage() {
        return 'endDate should not be set if multiDay is false';
    }
}

export function IsVirtual(property: 'virtual', validationOptions?: ValidationOptions) {
    {
        return (object: any, propertyName: string) => {
            registerDecorator({
                target: object.constructor,
                propertyName,
                options: validationOptions,
                constraints: [property],
                validator: IsVirtualConstraint
            });
        };
    }
}

@ValidatorConstraint({ name: 'IsVirtual' })
export class IsVirtualConstraint implements ValidatorConstraintInterface {
    validate(locationValue: string | null, args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        const virtualValue = (args.object as any)[relatedPropertyName];

        if (!virtualValue && !locationValue) return false;
        if (virtualValue && locationValue) return false;
        return true;
    }
    defaultMessage(args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        return `If an event is ${relatedPropertyName}, ${args.property} must not be assigned and viceversa`;
    }
}
