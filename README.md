# repository-notifier action

This action notifies repositories about a new releases.

Config fields

| field                      | Description                                                                                                | type (default value)    | required |
|----------------------------|------------------------------------------------------------------------------------------------------------|-------------------------|----------|
| dispatchEventName          | Name of the dispatched event to target repositories                                                        | string (notifier_event) | false    |
| defaultContentMatchPattern | Regex to determine if a rule matched, based on file contents. Must be filled if each rule doesn't have it. | string                  | false    |
| defaultRegexGroupNames     | Default name of the matched groups in the regex. Must be filled if each rule doesn't have it.              | string[]                | false    |
| rules                      | Rules to detect if a notification is needed                                                                | Rule[]                  | true     |
| mappers                    | Mappers to transform the notification data.                                                                | Mapper[]                | false    |
| imNotifiers                | Notifiers to send messages to Slack                                                                        | ImNotifier[]            | false    |


