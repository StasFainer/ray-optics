// Blocker
objTypes['aperture'] = {

  //建立物件 Create the obj
  create: function(mouse) {
    return {type: 'aperture', p1: mouse, p2: mouse, p3: mouse, p4: mouse};
  },

  //建立物件過程滑鼠按下 Mousedown when the obj is being constructed by the user
  c_mousedown: function(obj, mouse, ctrl, shift)
  {
    if (shift)
    {
      obj.p2 = snapToDirection(mouse, constructionPoint, [{x: 1, y: 0},{x: 0, y: 1},{x: 1, y: 1},{x: 1, y: -1}]);
    }
    else
    {
      obj.p2 = mouse;
    }

    obj.p3 = graphs.point(obj.p1.x * 0.6 + obj.p2.x * 0.4, obj.p1.y * 0.6 + obj.p2.y * 0.4);
    obj.p4 = graphs.point(obj.p1.x * 0.4 + obj.p2.x * 0.6, obj.p1.y * 0.4 + obj.p2.y * 0.6);
    

    if (!mouseOnPoint_construct(mouse, obj.p1))
    {
      draw();
    }
  },

  //建立物件過程滑鼠移動 Mousemove when the obj is being constructed by the user
  c_mousemove: function(obj, mouse, ctrl, shift)
  {
    if (shift)
    {
      obj.p2 = snapToDirection(mouse, constructionPoint, [{x: 1, y: 0},{x: 0, y: 1},{x: 1, y: 1},{x: 1, y: -1}]);
    }
    else
    {
      obj.p2 = mouse;
    }

    obj.p1 = ctrl ? graphs.point(2 * constructionPoint.x - obj.p2.x, 2 * constructionPoint.y - obj.p2.y) : constructionPoint;

    obj.p3 = graphs.point(obj.p1.x * 0.6 + obj.p2.x * 0.4, obj.p1.y * 0.6 + obj.p2.y * 0.4);
    obj.p4 = graphs.point(obj.p1.x * 0.4 + obj.p2.x * 0.6, obj.p1.y * 0.4 + obj.p2.y * 0.6);
    

    if (!mouseOnPoint_construct(mouse, obj.p1))
    {
      draw();
    }

  },
  //建立物件過程滑鼠放開 Mouseup when the obj is being constructed by the user
  c_mouseup: function(obj, mouse, ctrl, shift)
  {
    if (!mouseOnPoint_construct(mouse, obj.p1))
    {
      isConstructing = false;
      selectObj(selectedObj);
    }
  },

  //平移物件 Move the object
  move: function(obj, diffX, diffY) {
    //移動線段的第一點 Move the first point
    obj.p1.x = obj.p1.x + diffX;
    obj.p1.y = obj.p1.y + diffY;
    //移動線段的第二點 Move the second point
    obj.p2.x = obj.p2.x + diffX;
    obj.p2.y = obj.p2.y + diffY;

    obj.p3.x = obj.p3.x + diffX;
    obj.p3.y = obj.p3.y + diffY;

    obj.p4.x = obj.p4.x + diffX;
    obj.p4.y = obj.p4.y + diffY;
  },


  //繪圖區被按下時(判斷物件被按下的部分) When the drawing area is clicked (test which part of the obj is clicked)
  clicked: function(obj, mouse_nogrid, mouse, draggingPart) {
    

    if (mouseOnPoint(mouse_nogrid, obj.p1) && graphs.length_squared(mouse_nogrid, obj.p1) <= graphs.length_squared(mouse_nogrid, obj.p2))
    {
      draggingPart.part = 1;
      draggingPart.targetPoint = graphs.point(obj.p1.x, obj.p1.y);
      return true;
    }
    if (mouseOnPoint(mouse_nogrid, obj.p2))
    {
      draggingPart.part = 2;
      draggingPart.targetPoint = graphs.point(obj.p2.x, obj.p2.y);
      return true;
    }
    if (mouseOnPoint(mouse_nogrid, obj.p3) && graphs.length_squared(mouse_nogrid, obj.p3) <= graphs.length_squared(mouse_nogrid, obj.p4))
    {
      draggingPart.part = 3;
      draggingPart.targetPoint = graphs.point(obj.p3.x, obj.p3.y);
      draggingPart.requiresPBoxUpdate = true;
      return true;
    }
    if (mouseOnPoint(mouse_nogrid, obj.p4))
    {
      draggingPart.part = 4;
      draggingPart.targetPoint = graphs.point(obj.p4.x, obj.p4.y);
      draggingPart.requiresPBoxUpdate = true;
      return true;
    }

    var segment1 = graphs.segment(obj.p1, obj.p3);
    var segment2 = graphs.segment(obj.p2, obj.p4);
    if (mouseOnSegment(mouse_nogrid, segment1) || mouseOnSegment(mouse_nogrid, segment2))
    {
      draggingPart.part = 0;
      draggingPart.mouse0 = mouse; //開始拖曳時的滑鼠位置 Mouse position when the user starts dragging
      draggingPart.mouse1 = mouse; //拖曳時上一點的滑鼠位置 Mouse position at the last moment during dragging
      draggingPart.snapData = {};
      return true;
    }
    return false;
  },

  //拖曳物件時 When the user is dragging the obj
  dragging: function(obj, mouse, draggingPart, ctrl, shift) {
    var basePoint;

    var originalDiameter = graphs.length(obj.p3, obj.p4);
    if (draggingPart.part == 1 || draggingPart.part == 2)
    {
      if (draggingPart.part == 1)
      {
        //正在拖曳第一個端點 Dragging the first endpoint Dragging the first endpoint
        basePoint = ctrl ? graphs.midpoint(draggingPart.originalObj) : draggingPart.originalObj.p2;

        obj.p1 = shift ? snapToDirection(mouse, basePoint, [{x: 1, y: 0},{x: 0, y: 1},{x: 1, y: 1},{x: 1, y: -1},{x: (draggingPart.originalObj.p2.x - draggingPart.originalObj.p1.x), y: (draggingPart.originalObj.p2.y - draggingPart.originalObj.p1.y)}]) : mouse;
        obj.p2 = ctrl ? graphs.point(2 * basePoint.x - obj.p1.x, 2 * basePoint.y - obj.p1.y) : basePoint;
      }
      else
      {
        //正在拖曳第二個端點 Dragging the second endpoint Dragging the second endpoint
        basePoint = ctrl ? graphs.midpoint(draggingPart.originalObj) : draggingPart.originalObj.p1;

        obj.p2 = shift ? snapToDirection(mouse, basePoint, [{x: 1, y: 0},{x: 0, y: 1},{x: 1, y: 1},{x: 1, y: -1},{x: (draggingPart.originalObj.p2.x - draggingPart.originalObj.p1.x), y: (draggingPart.originalObj.p2.y - draggingPart.originalObj.p1.y)}]) : mouse;
        obj.p1 = ctrl ? graphs.point(2 * basePoint.x - obj.p2.x, 2 * basePoint.y - obj.p2.y) : basePoint;
      }
      
      var t = 0.5 * (1 - originalDiameter / graphs.length(obj.p1, obj.p2));
      obj.p3 = graphs.point(obj.p1.x * (1 - t) + obj.p2.x * t, obj.p1.y * (1 - t) + obj.p2.y * t);
      obj.p4 = graphs.point(obj.p1.x * t + obj.p2.x * (1 - t), obj.p1.y * t + obj.p2.y * (1 - t));
    }
    else if (draggingPart.part == 3 || draggingPart.part == 4)
    {
      if (draggingPart.part == 3)
      {
        basePoint = graphs.midpoint(obj);

        obj.p3 = snapToDirection(mouse, basePoint, [{x: (draggingPart.originalObj.p4.x - draggingPart.originalObj.p3.x), y: (draggingPart.originalObj.p4.y - draggingPart.originalObj.p3.y)}]);
        obj.p4 = graphs.point(2 * basePoint.x - obj.p3.x, 2 * basePoint.y - obj.p3.y);
      }
      else
      {
        basePoint = graphs.midpoint(obj);

        obj.p4 = snapToDirection(mouse, basePoint, [{x: (draggingPart.originalObj.p4.x - draggingPart.originalObj.p3.x), y: (draggingPart.originalObj.p4.y - draggingPart.originalObj.p3.y)}]);
        obj.p3 = graphs.point(2 * basePoint.x - obj.p4.x, 2 * basePoint.y - obj.p4.y);
      }
    }
    else if (draggingPart.part == 0)
    {
      //正在拖曳整條線 Dragging the entire line

      if (shift)
      {
        var mouse_snapped = snapToDirection(mouse, draggingPart.mouse0, [{x: 1, y: 0},{x: 0, y: 1},{x: (draggingPart.originalObj.p2.x - draggingPart.originalObj.p1.x), y: (draggingPart.originalObj.p2.y - draggingPart.originalObj.p1.y)},{x: (draggingPart.originalObj.p2.y - draggingPart.originalObj.p1.y), y: -(draggingPart.originalObj.p2.x - draggingPart.originalObj.p1.x)}], draggingPart.snapData);
      }
      else
      {
        var mouse_snapped = mouse;
        draggingPart.snapData = {}; //放開shift時解除原先之拖曳方向鎖定 Unlock the dragging direction when the user release the shift key
      }

      var mouseDiffX = draggingPart.mouse1.x - mouse_snapped.x; //目前滑鼠位置與上一次的滑鼠位置的X軸差 The X difference between the mouse position now and at the previous moment
      var mouseDiffY = draggingPart.mouse1.y - mouse_snapped.y; //目前滑鼠位置與上一次的滑鼠位置的Y軸差 The Y difference between the mouse position now and at the previous moment The Y difference between the mouse position now and at the previous moment
      //移動線段的第一點 Move the first point
      obj.p1.x = obj.p1.x - mouseDiffX;
      obj.p1.y = obj.p1.y - mouseDiffY;
      //移動線段的第二點 Move the second point
      obj.p2.x = obj.p2.x - mouseDiffX;
      obj.p2.y = obj.p2.y - mouseDiffY;

      obj.p3.x = obj.p3.x - mouseDiffX;
      obj.p3.y = obj.p3.y - mouseDiffY;

      obj.p4.x = obj.p4.x - mouseDiffX;
      obj.p4.y = obj.p4.y - mouseDiffY;

      //更新滑鼠位置 Update the mouse position
      draggingPart.mouse1 = mouse_snapped;
    }
  },

  //將物件畫到Canvas上 Draw the obj on canvas
  draw: function(obj, canvas) {
  //var ctx = canvas.getContext('2d');
  ctx.strokeStyle = getMouseStyle(obj, (colorMode && obj.wavelength && obj.isDichroic) ? wavelengthToColor(obj.wavelength || GREEN_WAVELENGTH, 1) : 'rgb(70,35,10)');
  ctx.lineWidth = 3;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(obj.p1.x, obj.p1.y);
  ctx.lineTo(obj.p3.x, obj.p3.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(obj.p2.x, obj.p2.y);
  ctx.lineTo(obj.p4.x, obj.p4.y);
  ctx.stroke();
  ctx.lineWidth = 1;
  if (obj === mouseObj) {
    ctx.fillStyle = 'magenta';
    ctx.fillRect(obj.p3.x - 1.5, obj.p3.y - 1.5, 3, 3);
    ctx.fillRect(obj.p4.x - 1.5, obj.p4.y - 1.5, 3, 3);
  }
  },

  //顯示屬性方塊 Show the property box
  p_box: function(obj, elem) {
    var originalDiameter = graphs.length(obj.p3, obj.p4);
    createNumberAttr(getMsg('diameter'), 0, 100, 1, originalDiameter, function(obj, value) {
      var t = 0.5 * (1 - value / graphs.length(obj.p1, obj.p2));
      obj.p3 = graphs.point(obj.p1.x * (1 - t) + obj.p2.x * t, obj.p1.y * (1 - t) + obj.p2.y * t);
      obj.p4 = graphs.point(obj.p1.x * t + obj.p2.x * (1 - t), obj.p1.y * t + obj.p2.y * (1 - t));
    }, elem);
    dichroicSettings(obj,elem);
  },

  rayIntersection: function(blackline, ray) {
    if (wavelengthInteraction(blackline,ray)) {
      var segment1 = graphs.segment(blackline.p1, blackline.p3);
      var segment2 = graphs.segment(blackline.p2, blackline.p4);
      var rp_temp1 = objTypes['lineobj'].rayIntersection(segment1, ray);
      if (rp_temp1) {
        return rp_temp1;
      }
      var rp_temp2 = objTypes['lineobj'].rayIntersection(segment2, ray);
      if (rp_temp2) {
        return rp_temp2;
      }
    }

    return false;
  },

  //當物件被光射到時 When the obj is shot by a ray
  shot: function(obj, ray, rayIndex, rp) {
    ray.exist = false;
  }

};
