import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, IconButton, List, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import AddItemsPanel from '../components/AddItemsPanel';
import ConfirmDialog from '../components/ConfirmDialog';
import ItemEditDialog from '../components/ItemEditDialog';
import { DividerRow, SectionHeaderRow } from '../components/ListStructureRows';
import ShoppingItemRow from '../components/ShoppingItemRow';
import SmartOrganizationButton from '../components/SmartOrganizationButton';
import StatusView from '../components/StatusView';
import TextPromptDialog from '../components/TextPromptDialog';
import usePreferences from '../hooks/usePreferences';
import useToast from '../hooks/useToast';
import * as shoppingItemService from '../services/shoppingItemService';
import * as shoppingListService from '../services/shoppingListService';
import * as shoppingSectionService from '../services/shoppingSectionService';
import {
  buildGroups,
  getMoveState,
  moveInArray,
  moveItemToGroup,
} from '../utils/listOrdering';
import { getPurchaseFeedback } from '../utils/purchaseMessages';
import { buildListRows, buildProgressText } from '../utils/shoppingLayout';

export default function ShoppingListDetailsScreen({ route, navigation }) {
  const isSmart = Boolean(route.params?.smart);
  const routeListId = route.params?.listId;
  const theme = useTheme();
  const { smartOrganization } = usePreferences();
  const { showToast } = useToast();

  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [isWorking, setIsWorking] = useState(false);

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [organizeMode, setOrganizeMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [sectionDialog, setSectionDialog] = useState(null);
  const [sectionToDelete, setSectionToDelete] = useState(null);

  const loadData = useCallback(async () => {
    setError('');

    try {
      // A lista inteligente atualiza as sugestões toda vez que é aberta
      const data = isSmart
        ? await shoppingListService.syncSmartList()
        : await shoppingListService.getListDetail(routeListId);

      setDetail({ list: data.list, sections: data.sections, items: data.items });
      navigation.setOptions({
        title: data.list.title,
        headerRight: () => (
          <View style={styles.headerActions}>
            <SmartOrganizationButton />
            {isSmart ? null : (
              <IconButton
                icon="pencil-outline"
                onPress={() => navigation.navigate('ShoppingListForm', { listId: routeListId })}
                accessibilityLabel="Editar título e observações da lista"
              />
            )}
          </View>
        ),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isSmart, routeListId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function handleRetry() {
    setIsLoading(true);
    loadData();
  }

  // Executa uma ação, recarrega a lista e avisa o resultado
  async function runAction(action, successMessage) {
    setIsWorking(true);
    try {
      await action();
      await loadData();

      if (successMessage) {
        showToast(successMessage, { type: 'success' });
      }
      return true;
    } catch (err) {
      showToast(err.message, { type: 'error' });
      return false;
    } finally {
      setIsWorking(false);
    }
  }

  async function handleToggleItem(item) {
    const nextStatus = item.status === 'purchased' ? 'pending' : 'purchased';

    setUpdatingItemId(item.id);
    try {
      const result = await shoppingItemService.changeItemStatus(
        item.id,
        nextStatus,
        smartOrganization
      );

      const nextItems = detail.items.map((existing) =>
        existing.id === result.item.id ? result.item : existing
      );
      setDetail({ ...detail, items: nextItems });

      const feedback = getPurchaseFeedback(result.outcome);
      if (feedback) {
        showToast(feedback.message, { type: feedback.type });
      }

      const isCompleted =
        !isSmart && nextItems.length > 0 && nextItems.every((entry) => entry.status === 'purchased');
      if (isCompleted) {
        showToast('Lista concluída! Ela agora aparece em "Listas concluídas".', {
          type: 'success',
        });
      }
    } catch (err) {
      showToast(err.message, { type: 'error' });
    } finally {
      setUpdatingItemId(null);
    }
  }

  const groups = useMemo(
    () => (detail ? buildGroups(detail.sections, detail.items) : {}),
    [detail]
  );
  const sectionIds = useMemo(
    () => (detail ? detail.sections.map((section) => section.id) : []),
    [detail]
  );
  const rows = useMemo(
    () => (detail ? buildListRows(detail.sections, detail.items) : []),
    [detail]
  );

  const currentListId = detail?.list.id;
  const progressText = detail ? buildProgressText(detail.items) : '';
  const notes = detail?.list.notes;

  function reorder(nextSectionIds, nextGroups, successMessage) {
    return runAction(
      () =>
        shoppingListService.reorderList(currentListId, {
          sections: nextSectionIds,
          items: nextGroups,
        }),
      successMessage
    );
  }

  function handleMoveItem(item, direction) {
    const key = item.section_id ?? 'none';

    reorder(sectionIds, { ...groups, [key]: moveInArray(groups[key], item.id, direction) });
  }

  function handleMoveSection(section, direction) {
    reorder(moveInArray(sectionIds, section.id, direction), groups);
  }

  function handleEditItem(item) {
    if (item.status === 'purchased') {
      showToast('Desmarque o item como comprado antes de editar.', { type: 'info' });
      return;
    }

    setEditingItem(item);
  }

  async function handleSaveItem(item, values) {
    const currentKey = item.section_id ?? 'none';

    const saved = await runAction(async () => {
      await shoppingItemService.updateItem(item.id, {
        name: values.name,
        quantity: values.quantity,
        unit: values.unit,
      });

      if (values.sectionKey !== currentKey) {
        await shoppingListService.reorderList(currentListId, {
          sections: sectionIds,
          items: moveItemToGroup(groups, item.id, currentKey, values.sectionKey),
        });
      }
    }, 'Item atualizado.');

    if (saved) setEditingItem(null);
  }

  async function handleRemoveItem(item) {
    const removed = await runAction(() => shoppingItemService.deleteItem(item.id), 'Item removido.');

    if (removed) setEditingItem(null);
  }

  async function handleConfirmSection(title) {
    const target = sectionDialog.section;

    const saved = await runAction(
      () =>
        target
          ? shoppingSectionService.renameSection(target.id, title)
          : shoppingSectionService.createSection(currentListId, { title }),
      target ? 'Seção renomeada.' : 'Seção criada.'
    );

    if (saved) setSectionDialog(null);
  }

  function handleAddDivider() {
    runAction(
      () => shoppingSectionService.createSection(currentListId, { type: 'divider' }),
      'Divisor adicionado.'
    );
  }

  async function handleConfirmDeleteSection() {
    const removed = await runAction(
      () => shoppingSectionService.deleteSection(sectionToDelete.id),
      sectionToDelete.type === 'divider' ? 'Divisor removido.' : 'Seção removida.'
    );

    if (removed) setSectionToDelete(null);
  }

  function renderRow({ item: row }) {
    if (row.type === 'section') {
      if (!organizeMode) {
        return <List.Subheader>{row.section.title}</List.Subheader>;
      }

      return (
        <SectionHeaderRow
          title={row.section.title}
          {...getMoveState(sectionIds, row.section.id)}
          onMoveUp={() => handleMoveSection(row.section, -1)}
          onMoveDown={() => handleMoveSection(row.section, 1)}
          onRename={() => setSectionDialog({ section: row.section })}
          onDelete={() => setSectionToDelete(row.section)}
        />
      );
    }

    if (row.type === 'divider') {
      if (!organizeMode) {
        return <Divider bold style={styles.divider} />;
      }

      return (
        <DividerRow
          {...getMoveState(sectionIds, row.section.id)}
          onMoveUp={() => handleMoveSection(row.section, -1)}
          onMoveDown={() => handleMoveSection(row.section, 1)}
          onDelete={() => setSectionToDelete(row.section)}
        />
      );
    }

    const key = row.item.section_id ?? 'none';

    return (
      <ShoppingItemRow
        item={row.item}
        mode={organizeMode ? 'organize' : 'check'}
        disabled={updatingItemId === row.item.id || isWorking}
        {...getMoveState(groups[key] || [], row.item.id)}
        onToggle={() => handleToggleItem(row.item)}
        onEdit={() => handleEditItem(row.item)}
        onMoveUp={() => handleMoveItem(row.item, -1)}
        onMoveDown={() => handleMoveItem(row.item, 1)}
      />
    );
  }

  const header = (
    <View>
      {notes ? (
        <Card style={styles.notes}>
          <Card.Content>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Observações
            </Text>
            <Text variant="bodyMedium">{notes}</Text>
          </Card.Content>
        </Card>
      ) : null}

      {progressText ? (
        <Text
          variant="bodyMedium"
          style={[styles.progress, { color: theme.colors.onSurfaceVariant }]}
        >
          {progressText}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          mode={showAddPanel ? 'contained-tonal' : 'contained'}
          icon={showAddPanel ? 'close' : 'plus'}
          onPress={() => setShowAddPanel((current) => !current)}
        >
          {showAddPanel ? 'Fechar' : 'Adicionar itens'}
        </Button>
        <Button
          mode={organizeMode ? 'contained-tonal' : 'outlined'}
          icon={organizeMode ? 'check' : 'swap-vertical'}
          onPress={() => setOrganizeMode((current) => !current)}
        >
          {organizeMode ? 'Concluir organização' : 'Organizar'}
        </Button>
      </View>

      {organizeMode ? (
        <View style={styles.actions}>
          <Button mode="outlined" icon="folder-plus-outline" onPress={() => setSectionDialog({})}>
            Nova seção
          </Button>
          <Button mode="outlined" icon="minus" onPress={handleAddDivider} disabled={isWorking}>
            Divisor
          </Button>
        </View>
      ) : null}

      {showAddPanel && currentListId ? (
        <AddItemsPanel listId={currentListId} onChanged={loadData} />
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusView isLoading={isLoading} error={error} onRetry={handleRetry}>
        <FlatList
          data={rows}
          keyExtractor={(row) => row.key}
          renderItem={renderRow}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <Text variant="bodyLarge" style={styles.empty}>
              {isSmart
                ? 'Nenhuma sugestão no momento. Quando um produto ficar com estoque baixo ou zerado, ele aparece aqui.'
                : 'Esta lista ainda não tem itens. Toque em "Adicionar itens" para começar.'}
            </Text>
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
        />
      </StatusView>

      {editingItem && detail ? (
        <ItemEditDialog
          key={editingItem.id}
          item={editingItem}
          sections={detail.sections.filter((section) => section.type === 'section')}
          isWorking={isWorking}
          onSave={(values) => handleSaveItem(editingItem, values)}
          onRemove={() => handleRemoveItem(editingItem)}
          onDismiss={() => setEditingItem(null)}
        />
      ) : null}

      <TextPromptDialog
        visible={Boolean(sectionDialog)}
        title={sectionDialog?.section ? 'Renomear seção' : 'Nova seção'}
        label="Título da seção"
        initialValue={sectionDialog?.section?.title ?? ''}
        isLoading={isWorking}
        onConfirm={handleConfirmSection}
        onDismiss={() => setSectionDialog(null)}
      />

      <ConfirmDialog
        visible={Boolean(sectionToDelete)}
        title={sectionToDelete?.type === 'divider' ? 'Remover divisor' : 'Excluir seção'}
        message={
          sectionToDelete?.type === 'divider'
            ? 'Remover este divisor da lista?'
            : `Excluir a seção "${sectionToDelete?.title}"? Os itens dela continuam na lista, sem seção.`
        }
        confirmLabel="Remover"
        isLoading={isWorking}
        onConfirm={handleConfirmDeleteSection}
        onDismiss={() => setSectionToDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 48,
  },
  notes: {
    marginBottom: 12,
  },
  progress: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  divider: {
    marginVertical: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
});