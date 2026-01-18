export const ROLE_PERMISSIONS = {
    super_admin: {
        canManageAdmins: true,
        canManageArticles: true,
        canPublish: true,
        canDelete: true,
        canManageCategories: true,
        canManageAds: true,
    },

    editor: {
        canManageAdmins: false,
        canManageArticles: true,
        canPublish: false,
        canDelete: false,
        canManageCategories: false,
        canManageAds: false,
    },
};
