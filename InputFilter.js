/*
 * InputFilter.js: ненавязчивая фильтрация нажатий клавиш для тегов <input>
 *
 * Данный модуль отыскивает все элементы <input type="text"> в документе,
 * которые имеют нестандартный атрибут "allowed". Регистрирует обработчик
 * события onkeypress для всех таких элементов с целью ограничить возможность
 * ввода символов только теми, которые перечислены в значении атрибута allowed.
 * Если элемент <input> имеет при этом атрибут "messageid", значение
 * этого атрибута воспринимается как id другого элемента документа.
 * Когда пользователь пытается ввести недопустимый символ, отображается
 * элемент messageid. Когда пользователь вводит допустимый символ,
 * элемент messageid скрывается. Элемент с данным идентификатором предназначен
 * для вывода пояснений, почему попытка ввода того или иного символа была отвергнута.
 * Изначально этот элемент с помощью CSS стиля должен быть сделан невидимым.
 *
 * Далее приводятся некоторые примеры HTML кода, использующие этот модуль.
 * Почтовый индекс:
 * <input id="zip" type="text" allowed="0123456789" messageid="zipwarn">
 * <span id="zipwarn" style="color:red;visibility:hidden">Только цифры</span>
 *
 * В броузерах, таких как IE, которые не поддерживают addEventListener(),
 * обработчик keypress регистрируется этим модулем за счет переопределения
 * возможно существующего обработчика события keypress. *
 * Этот модуль абсолютно ненавязчив, поскольку он не определяет никаких * символов в глобальном пространстве имен.
 */
(function() { // Весь модуль оформлен в виде анонимной функции
   // По окончании загрузки документа вызывается функция init()
   if (window.addEventListener) {
      window.addEventListener("load", init, false);
   } else if (window.attachEvent) {
      window.attachEvent("onload", init);
   }

   // Найти все теги <input>, для которых необходимо зарегистрировать
   // обработчик события
   function init() {
      var inputtags = document.getElementsByTagName("input");
      for (var i = 0 ; i < inputtags.length; i++) { // Обойти все теги
         var tag = inputtags[i];

         if (tag.type != "text") continue; // Только текстовые поля

         var allowed = tag.getAttribute("allowed");
         if (!allowed) continue; // И только если есть аттрибут allowed

         // Зарегистрировать функцию обработчик
         if (tag.addEventListener) {
            tag.addEventListener("keypress", filter, false);
         } else {
            // attachEvent не используется, потому что в этом случае
            // функции обработчику передается некорректное значение // ключевого слова this.
            tag.onkeypress = filter;
         }
      }
   }

   // Это обработчик события keypress, который выполняет фильтрацию ввода
   function filter(event) {
      // Получить объект события и код символа переносимым способом
      var e = event || window.event; // Объект события клавиатуры
      var code = e.charCode || e.keyCode; // Какая клавиша была нажата

      // Если была нажата функциональная клавиша, не фильтровать ее
      if (e.charCode == 0) return true; // Функциональная клавиша (только Firefox)
      if (e.ctrlKey || e.altKey) return true; // Нажата Ctrl или Alt
      if (code < 32) return true; // Управляющий ASCII символ

      // Теперь получить информацию из элемента ввода
      var allowed = this.getAttribute("allowed"); // Допустимые символы
      var messageElement = null; // Сообщение об ошибке
      var messageid = this.getAttribute("messageid"); // id элемента с сообщением,

      // Если существует атрибут messageid, получить элемент, если есть
      if (messageid) {
         messageElement = document.getElementById(messageid);
      }

      // Преобразовать код символа в сам символ
      var c = String.fromCharCode(code);

      // Проверить, принадлежит ли символ к набору допустимых символов
      if (allowed.indexOf(c) >  0) {
         // Если c   допустимый символ, скрыть сообщение, если существует
         // И принять ввод символа
         if (messageElement) {
            messageElement.style.visibility = "hidden"; return true;
         }
      } else {
         // Если c   недопустимый символ, отобразить сообщение
         // И отвергнуть это событие keypress
         if (messageElement) messageElement.style.visibility = "visible";
         if (e.preventDefault) e.preventDefault();
         if (e.returnValue) e.returnValue = false;
         return false;
      }
   }
})();
