export class PostAttendeeQuestionnaireResponseEntity {
    collectibleId: string;
    beneficiary: string;
    answers: PostAttendeeQuestionnaireResponseItemEntity;
}

export class PostAttendeeQuestionnaireResponseItemEntity {
    [key: string]: string;
}
