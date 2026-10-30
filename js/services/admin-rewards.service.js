/**
 * Магазин наград LifeQuest - Управление ролевыми очками для администраторов
 */

export const ADMIN_REWARDS = {
  // Награды, которые можно выдавать через магазин
  items: [
    { id: 'reward-1', name: 'Базовая помощь', description: 'Выдача 6 RP пользователю', rpValue: 6, icon: '🎁' },
    { id: 'reward-2', name: 'Мотивация', description: 'Выдача 8 RP для поддержки', rpValue: 8, icon: '⚡' },
    { id: 'reward-3', name: 'Признание', description: 'Выдача 10 RP за достижение', rpValue: 10, icon: '🏆' },
    { id: 'reward-4', name: 'Помощь семье', description: 'Выдача 12 RP для всей семьи', rpValue: 12, icon: '👨‍👩‍👧‍👦' },
    { id: 'reward-5', name: 'Превосходство', description: 'Выдача 15 RP за выдающуюся работу', rpValue: 15, icon: '⭐' },
  ],
  
  // Логика выдачи наград с проверкой ролевой точки (6 RP)
  giveReward(rewardId, userId) {
    const reward = this.items.find(item => item.id === rewardId);
    if (!reward || !userId) return false;
    
    // Здесь должна быть проверка ролевых очков пользователя
    // В реальном приложении данные сохраняются в localStorage/cookie
    let userRPs = parseInt(localStorage.getItem(`rp_${userId}`) || '0');
    
    if (userRPs >= reward.rpValue) {
      userRPs -= reward.rpValue;
      localStorage.setItem(`rp_${userId}`, userRPs);
      return true; // Магазин успешно использовал 6 RP для выдачи награды
    } else {
      return false; // Не хватает очков на выдачу
    }
  },
  
  getBalance(userId) {
    const rps = parseInt(localStorage.getItem(`rp_${userId}`) || '0');
    return rps;
  }
};

// Экспорт для использования в UI
window.AdminStore = ADMIN_REWARDS;
