# Email Templates and Auth0

You'll find various email templates in this folder for communications we make with new users.

## Git commiting has no impact on what is deployed! This is just version history.

It's **very important** to realize that what is present here in the git repo has no direct impact on what is actually deployed for the email templates. We make commits here to track email versions over time, be able to revert to older versions, etc. But there is no connection to any kind of CI/CD or automated deploy: if you commit changes to the email templates and merge them in **it will change nothing about the deployed email templates.**

**To make changes, you must go into the Auth0 dashboard** and directly save the new version of the template there. In the Auth0 console, you can find it under `Branding` > `Email Templates`. Remember you'll need to save the changes for each tenant (environment, eg, Staging, Prod, etc) you want to update, be sure you don't accidentally update just the Staging template or something.

In addition to the content of the email template, there are a few other things we only track in the Auth0 console. If you want to change the email's subject line or from address, you'll need to do that there, and we don't have version tracking for those aspects. These values aren't necessarily identical across tenants (environments): for instance, we've prefixed the subject line with `[STAGING]` for everything in Staging.

### Templates we actively use

Auth0 has a number of different email templates available. As of right now, we only use a couple of them. Here are the templates we are currently using:

- **"User Invitation"**: This is what the user gets upon being invited to the platform. It corresponds to the files `invite_new_user_email_template_prod.html` / `_staging.html`.
  - The difference between the `_prod` and `_staging` versions of the template is very small: there's a few URLs in the email, and the difference is just to target the correct set of URLs based on the environemnt.
  - There's also the Auth0 template "Verification Email (using Link)". At some point, we set the content of that template and it's identical to what's in "User Invitation", but it also appears to be disabled? Just in case, I [Vince] am continuing to keep them in sync, but I'm pretty confident it could be dropped entirely without any issue.
- **"Welcome Email"**: This is what the user gets once they've signed up. It corresponds to the file `welcome_email_template.html`.

### Playbook for updating email templates

You don't have to follow this exactly, this is just here to outline how you should expect to handle updating email templates. The important parts are (A) remember that committing to the repo and merging does not deploy; (B) You deploy by updating the appropriate tenant (environment) in Auth0; (C) When the dust has settled, you should have committed and merged your changes to the main branch so email versions can be tracked over time.

1. Locally make tweaks to the template(s) you're updating. Open the template in your local web browser to verify the changes appear to be correct. (Note: if you're making major style changes, you should probably look into support across various email clients. I don't really know the space, but it seems like email clients don't support HTML and CSS features you might take for granted in a reasonably recent web browser.)
2. Commit the changes to your local branch.
3. Update the Auth0 tenant for Staging. Test out your email template and make sure it works as expected. (You probably should update any other non-Prod tenants at this point as well.)
4. Push up your branch and merge it in.
5. Update the Auth0 tenant for Prod when you're ready for users to start receiving the new version of the template.
