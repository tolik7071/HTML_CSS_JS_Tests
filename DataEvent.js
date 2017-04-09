/*
 * DataEvent.js: отправляет и принимает события ondataavailable.
 *
 * Этот модуль определяет две функции, DataEvent.send() и DataEvent.receive(),
 * с помощью которых выполняются отправка искусственных событий dataavailable
 * и регистрация обработчиков этих событий. Программный код написан так, чтобы
 * работать в броузере Firefox и других DOM совместимых броузарах, а также в IE.
 *
 * Модель обработки событий DOM позволяет искусственно генерировать события
 * любого типа, но модель обработки событий IE поддерживает искусственные
 * события лишь предопределенных типов. События dataavailable относятся
 * к наиболее универсальному предопределенному типу, поддерживаемому IE,
 * именно потому они здесь используются.
 *
 * Обратите внимание: отправка события методом DataEvent.send() не означает,
 * что событие будет поставлено в очередь на обработку, как это происходит
 * с реальными событиями. Вместо этого зарегистрированные обработчики
 * вызываются немедленно.
 */

 var DataEvent = {};

/*
 * Отправляет искусственное событие ondataavailable заданному элементу.
 * Объект события включает в себя свойства с именами datatype и data,
 * которым присваиваются заданные значения. Свойство datatype принимает
 * значение строки или другого элементарного типа (или null),
 * идентифицирующего тип этого сообщения, а data может принимать значение
 * любого JavaScript типа, включая массивы и объекты.
 */
DataEvent.send = function(target, datatype, data) {
   if (typeof target == "string") {
      target = document.getElementById(target);
   }

   // Создать объект события. Если создать его невозможно,
   // просто вернуть управление
   if (document.createEvent) {
      // Модель событий DOM
      
      // Создать событие с заданным именем модуля событий.
      // Для событий мыши используется "MouseEvents".
      var e = document.createEvent("Events");

      // Инициировать объект события, используя метод init заданного модуля.
      // Здесь указываются тип события, способность к всплытию
      // и признак невозможности отмены.
      // См. описание Event.initEvent, MouseEvent.initMouseEvent и
      // UIEvent.initUIEvent
      e.initEvent("dataavailable", true, false);
   } else if (document.createEventObject) {
      // Модель событий IE

      // В модели событий IE достаточно вызвать простой метод
      var e = document.createEventObject();
   } else {
      // В других броузерах ничего не делать
      return;
   }

   // Здесь к объекту события добавляются нестандартные свойства.
   // Кроме того, необходимо определить значения существующих свойств.
   e.datatype = datatype;
   e.data = data;

   // Отправить событие заданному элементу.
   if (target.dispatchEvent) target.dispatchEvent(e); // DOM
   else if (target.fireEvent) target.fireEvent("ondataavailable", e); // IE
};

/*
 * Регистрирует обработчик события ondataavailable в заданном элементе.
 */
DataEvent.receive = function(target, handler) {
   if (typeof target == "string") {
      target = document.getElementById(target);
   }

   if (target.addEventListener) {
      target.addEventListener("dataavailable", handler, false);
   } else if (target.attachEvent) {
      target.attachEvent("ondataavailable", handler);
   }
};
