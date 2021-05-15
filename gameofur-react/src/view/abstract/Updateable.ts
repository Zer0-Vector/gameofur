export interface Updateable<UpdateDescriptor> {
    update(update?:UpdateDescriptor): Promise<void>;
}
