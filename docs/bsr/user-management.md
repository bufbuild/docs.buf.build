---
id: user-management
title: User Management
---

# User Management

## Organization Roles

Every user that is part of an organization will have an explicit role. Note that users are unable to modify their own role. If you need to lower your access please have another organization user perform this action, or, leave the organization and request to be re-added with the desired role.
	
### Owner

- Users that require unrestricted access to the organization, its settings and all resources owned by the organization. 
- Can delete organization. All resources such as repositories, templates and plugins must be deleted before the organization can be deleted.

### Admin

- Can manage user roles, except owners.
- Can add and delete resources such as [repositories](../bsr/overview.md#module), [templates](../bsr/remote-generation/concepts/#template) and [plugins](../bsr/remote-generation/concepts/#plugin).

### Member

- Can view resources and users within the organization.

### Base resource roles

> *Base resource roles coming soon.*

Every organization has a set of base resource roles that apply to all members of the organization. The following are the default roles:

| Repository | Template | Plugin |
|:--|:--|:--|
| **Write**  | **Write** | **Write** |

Organization owners can modify the base resource roles depending on the requirements of the organization.

## Resource Roles

> *Resource roles coming soon.*

Resource roles are explicit roles granted to a user on an individual resource, such as a repository, template or plugin.

The most common use-cases for explicit resource roles are:

- Outside collaborators. This is useful when users outside your organization require access to specific resource(s) within the organization, but you do not want them to be a member of the organization.
- Elevated permissions for organization members. This is useful when the organization base resource roles are set to `read` and specific user(s) require `write` or `admin` permissions. 

When computing the role on a resource, the highest role will take precedence. For example, an organization has `write` as the base repository role, and the user was granted the `admin` role on a specific repository. The final computed user role on the repository will be `admin`.

### Owner

- Unrestricted access to the resource.

### Admin

- Can update the resource settings and deprecation notices.
- Can manage resource roles, except owners.
- Can delete the resource.

### Write

- Can perform modifying operations, except for deletes.

### Read

- Can view the resource.