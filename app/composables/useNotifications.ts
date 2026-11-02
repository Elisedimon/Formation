// composables/useNotifications.ts
export interface Notification {
  id: number
  title: string
  body: string
  read: boolean
  time: string
}

export function useNotifications() {
  // Tableau vide par défaut (plus de données de test)
  const notifications = useState<Notification[]>('notifications', () => [])

  // État partagé pour l'ouverture du panneau
  const notifOpen = useState<boolean>('notif-open', () => false)

  // Nombre de notifications non lues
  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.read).length
  )

  // Marquer toutes comme lues
  function markAllRead() {
    notifications.value.forEach((n) => {
      n.read = true
    })
  }

  // Marquer une notification comme lue
  function markAsRead(id: number) {
    const notif = notifications.value.find((n) => n.id === id)
    if (notif) notif.read = true
  }

  // Ajouter une notification
  function addNotification(notif: Omit<Notification, 'id' | 'read' | 'time'>) {
    notifications.value.unshift({
      ...notif,
      id: Date.now(),
      read: false,
      time: 'À l’instant'
    })
  }

  // Supprimer une notification
  function removeNotification(id: number) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  // Vider toutes les notifications
  function clearAll() {
    notifications.value = []
  }

  return {
    notifications,
    notifOpen,
    unreadCount,
    markAllRead,
    markAsRead,
    addNotification,
    removeNotification,
    clearAll
  }
}