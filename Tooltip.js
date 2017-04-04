/*
 * Tooltip.js: простейшие всплывающие подсказки, отбрасывающие тень.
 *
 * Этот модуль определяет класс Tooltip. Объекты класса Tooltip создаются
 * с помощью конструктора Tooltip(). После этого подсказку можно сделать
 * видимой вызовом метода show(). Чтобы скрыть подсказку, следует
 * вызвать метод hide().
 *
 * Обратите внимание: для корректного отображения подсказок с использованием
 * этого модуля необходимо добавить соответствующие определения CSS классов
 * Например:
 *
 * .tooltipShadow {
 *     background: url(shadow.png); /* полупрозрачная тень * /
 * }
 *
 * .tooltipContent {
 *     left:  4px; top:  4px; /* смещение относительно тени * /
 *     background-color: #ff0; /* желтый фон * /
 *     border: solid black 1px; /* тонкая рамка черного цвета * /
 *     padding: 5px; /* отступы между текстом и рамкой * /
 *     font: bold 10pt sans serif; /* небольшой жирный шрифт * /
 * }
 *
 * В броузерах, поддерживающих возможность отображения полупрозрачных изображений
 * формата PNG, можно организовать отображение полупрозрачной тени.
 * В остальных броузерах придется использовать для тени сплошной цвет или
 * эмулировать полупрозрачность с помощью изображения формата GIF.
 */

var tooltip = new Tooltip();

// Функция конструктор класса Tooltip
function Tooltip() {
   this.tooltip = document.createElement("div"); // Создать div для тени
   this.tooltip.style.position = "absolute"; // Абсолютное позиционирование
   this.tooltip.style.visibility = "hidden"; // Изначально подсказка скрыта
   this.tooltip.className = "tooltipShadow"; // Определить его стиль
   this.content = document.createElement("div"); // Создать div с содержимым
   this.content.style.position = "relative"; // Относительное позиционирование
   this.content.className = "tooltipContent"; // Определить его стиль
   this.tooltip.appendChild(this.content); // Добавить содержимое к тени
}

// Определить содержимое, установить позицию окна с подсказкой и отобразить ее
Tooltip.prototype.show = function(text, x, y) {
   // Записать текст подсказки.
    this.content.innerHTML = text;

    // Определить положение.
    this.tooltip.style.left = x + "px";
    this.tooltip.style.top = y + "px";

    // Сделать видимой.
    this.tooltip.style.visibility = "visible";

    // Добавить подсказку в документ, если это еще не сделано
    if (this.tooltip.parentNode != document.body)
      document.body.appendChild(this.tooltip);
};

// Скрыть подсказку
Tooltip.prototype.hide = function() {
   this.tooltip.style.visibility = "hidden"; // Сделать невидимой.
};

// Следующие значения используются методом schedule(), определенным далее.
// Они используются как константы, но доступны для записи, поэтому вы можете
// переопределить эти значения, предлагаемые по умолчанию.
Tooltip.X_OFFSET = 5; // пикселов вправо от указателя мыши
Tooltip.Y_OFFSET = 5; // пикселов вниз от указателя мыши
Tooltip.DELAY = 500; // миллисекунд после события mouseover

/*
 * Данный метод планирует появление всплывающей подсказки над указанным
 * элементом через Tooltip.DELAY миллисекунд от момента события.
 * Аргумент “e” должен быть объектом события mouseover.
 * Данный метод извлекает * координаты мыши из объекта события,
 * преобразует их из оконных координат
 * в координаты документа и добавляет вышеуказанные смещения.
 * Определяет текст подсказки, обращаясь к атрибуту "tooltip" заданного
 * элемента. Данный метод автоматически регистрирует обработчик события
 * onmouseout и отменяет его регистрацию. Этот обработчик выполняет скрытие
 * подсказки или отменяет ее запланированное появление.
 */
Tooltip.prototype.schedule = function(target, e) {
   // Получить текст для отображения. Если текст отсутствует
   // ничего не делать.
   var text = target.getAttribute("tooltip");
   if (!text) {
      return;
   }

   // Объект события хранит оконные координаты указателя мыши.
   // Поэтому они преобразуются в координаты документа с помощью модуля Geometry.
   var x = e.clientX + Geometry.getHorizontalScroll();
   var y = e.clientY + Geometry.getVerticalScroll();

   // Добавить смещения, чтобы подсказка появилась правее и ниже указателя мыши.
   x += Tooltip.X_OFFSET;
   y += Tooltip.Y_OFFSET;

   // Запланировать появление подсказки.
   var self = this; // Это необходимо для вложенных функций
   var timer = window.setTimeout(function() {
      self.show(text, x, y);
   }, Tooltip.DELAY);

   // Зарегистрировать обработчик onmouseout, чтобы скрыть подсказку
   // или отменить появление запланированной подсказки.
   if (target.addEventListener) {
      target.addEventListener("mouseout", mouseout, false);
   } else if (target.attachEvent) {
      target.attachEvent("onmouseout", mouseout);
   } else {
      target.onmouseout = mouseout;
   }

   // Реализация слушателя события приводится далее
   function mouseout() {
      self.hide(); // Скрыть подсказку, если она уже на экране,=

      // отменить все запланированные подсказки
      // и удалить себя, т.к. обработчик запускается единожды
      window.clearTimeout(timer);

      if (target.removeEventListener) {
         target.removeEventListener("mouseout", mouseout, false);
      } else if (target.detachEvent) {
         target.detachEvent("onmouseout",mouseout);
      } else {
         target.onmouseout = null;
      }
   }
}
