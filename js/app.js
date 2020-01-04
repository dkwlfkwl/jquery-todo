(function (window) {
	'use strict';

	var $todo = $('.todoapp');
	var $inputItem = $todo.find('.new-todo');
	var $todoList = $todo.find('.todo-list');
	var $footer = $todo.find('.footer');
	var $filterButton = $footer.find('.filters a');
	var $clearCompleted = $footer.find('.clear-completed');
	var $count = $footer.find('.todo-count strong');
	var listFilter = '';
	var todolist = [];
	var localStorageData = localStorage.getItem('todolist');

	if(localStorageData !== '') {
		todolist = JSON.parse(localStorageData);
	}

	function dataSave() {
		localStorage.setItem('todolist', JSON.stringify(todolist));
	}

	function itemView() {
		var items = '';

		for(var i = 0, len = todolist.length; i < len; i++) {
			var classNames = [];

			if(todolist[i].edit) classNames.push('editing');
			if(todolist[i].complete) classNames.push('completed');

			// classNames = ['editing', 'completed']
			// classNames.join(' ')
			// => 'editing completed'

			items += '<li class="' + classNames.join(' ') + '" data-id="' + todolist[i].id + '" data-complete="' + todolist[i].complete + '"><div class="view"><input class="toggle" type="checkbox" ' + (todolist[i].complete ? 'checked' : '') + '><label>' + todolist[i].content + '</label><button class="destroy"></button></div><input class="edit" value="' + todolist[i].content + '"></li>';
		}

		$todoList.html(items);

		$todoList.children().each(function() {
			var $this = $(this);

			$this.show();

			if(listFilter === 'active') {
				if($this.data('complete')) {
					$this.hide();
				}
			}

			if(listFilter === 'completed') {
				if(!$this.data('complete')) {
					$this.hide();
				}
			}
		});

		var activeItem = todolist.filter(function(element) {
			return element.complete === false;
		});

		$count.html(activeItem.length);

		$filterButton.each(function() {
			var $this = $(this);
			var href = $this.attr('href').replace('#/', ''); // #/active -> active

			if(listFilter === href) {
				$this.addClass('selected');
			} else {
				$this.removeClass('selected');
			}
		});

		var completedItem = todolist.filter(function(element){
			return element.complete === true;
		});

		if(completedItem.length) {
			$clearCompleted.show();
		} else {
			$clearCompleted.hide();
		}

		if(todolist.length) {
			$footer.show();
		} else {
			$footer.hide();
		}

		dataSave();
	}

	$inputItem.keyup(function(e) {
		var $this = $(this);
		var id = new Date().valueOf();
		var complete = false;
		var content = $this.val().trim();

		if (e.keyCode === 13) {
			if(content.length === 0 || !content) {
				$this.val('');
				return false;
			}

			todolist.push({
				id: id,
				edit: false,
				complete: complete,
				content: content
			});

			$this.val('');
			itemView();
		}
	});

	$todoList.on('change', '.toggle', function(e) {
		var tgId = $(e.target).closest('li').data('id');

		todolist = todolist.map(function(element) {
			if(element.id === tgId) {
				element.complete = !element.complete;
			}
			return element;
		});

		itemView();
	});

	$todoList.on('click', '.destroy', function(e) {
		var tgId = $(e.target).closest('li').data('id');

		todolist = todolist.filter(function(element) {
			return element.id !== tgId;
		});

		itemView();
	});

	$todo.on('dblclick', '.view label', function(e) {
		var $tgli = $(e.target).closest('li');
		var tgId = $tgli.data('id');
		var $input = $tgli.find('.edit');
		var tgVal = $input.val();

		todolist = todolist.map(function(item) {
			if(item.id === tgId) {
				item.edit = true;
			}
			return item;
		});

		itemView();

		$todoList.find('li').filter('[data-id="' + tgId + '"]').find('.edit').val('').val(tgVal).focus();
	});

	$todo.on('keyup focusout', '.edit', function(e) {
		var $input = $(e.target);
		var $tgli = $input.closest('li');
		var $label = $tgli.find('label');
		var tgId = $tgli.data('id');

		if (e.keyCode === 13 || e.type === 'focusout') {
			var text = $input.val().trim();

			if(text.length) {
				$input.val(text);
				$label.html(text);
				$input.hide();

				todolist = todolist.map(function(item) {
					if(item.id === tgId) {
						item.content = text;
						item.edit = false;
					}
					return item;
				});
			}
			else {
				todolist = todolist.filter(function(item) {
					return item.id !== tgId;
				});
			}

			itemView();
		}
	});

	$todo.on('click', '.filters a', function(e) {
		var $tg = $(e.target);

		e.preventDefault();

		if($tg.attr('href') === '#/') {
			listFilter = '';
		} else if($tg.attr('href') === '#/active') {
			listFilter = 'active';
		} else if($tg.attr('href') === '#/completed') {
			listFilter = 'completed';
		}

		itemView();
	});

	$todo.on('click', '.footer .clear-completed', function() {
		todolist = todolist.filter(function(element){
			return element.complete === false;
		});

		itemView();
	});

	$('.toggle-all').on('change', function() {
		var $this = $(this);

		todolist = todolist.map(function(element) {
			element.complete = $this.is(':checked');
			return element;
		});

		itemView();
	});

	itemView();

})(window);
