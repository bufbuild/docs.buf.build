---
id: user-management
title: User Management
---

# User Management

## Organization Roles

### Base resource roles

Organization owners can set base resource roles that apply to all members of the organization. The following are the default resource roles, but can be configured by the organization:

- repository: `write`
- template: `write`
- plugin: `write`
	
### **`Owner`**

- Users that require unrestricted access to the organization, its settings and all resources owned by the organization. 
- Can delete organization. All resources such as repositories, templates and plugins must be removed before an organization can be deleted.

### **`Admin`**

- Can manage user roles, except owners.
- Can add and delete resources such as repositories, templates and plugins

### **`Member`**

- Can view resources and users within the organization.


## Resource Roles

> *Coming soon.*

Resource roles are explicit roles granted to a user on an individual resource, such as a repository, template or plugin.
The most common use-cases for explicit resource roles are:

- Outside collaborators. This is useful when users outside your organization require access to specific resource(s) within the organization, but you do not want them to be a member of the organization.
- Elevated permissions for organization members. This is useful when the organization base resource roles are set to `read` and specific user(s) require `write` or `admin` permissions. 

When computing the role on a resource, the highest role will take precedence. Example, an organization has `write` as the base repository role, but the user was mistakingly granted the `read` role on a specific repository. The user role on the repository will be `write`.

### **`Owner`**

- Unrestricted access to the resource.

### **`Admin`**

- Can update resource settings, visibility and deprecation notices.
- Can manage resource role, except owners.
- Can delete the resource.

### **`Write`**
- Can perform modifying operations.

### **`Read`**
- Can view the resource.